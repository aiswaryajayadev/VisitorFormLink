import { ChangeDetectionStrategy,ChangeDetectorRef,Component } from '@angular/core';
import {   AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule,isFormControl,ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { IConfig, NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { Router, RouterLink } from '@angular/router';
import { DataserviceService } from '../../../services/VisitorFormServices/dataservice.service';
import { PurposeResponse } from '../../../Models/IPurposeResponse';
import { DeviceResponse } from '../../../Models/IDeviceResponse';
import { NgxImageCompressService } from 'ngx-image-compress';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { MatDialog } from '@angular/material/dialog';
import { Message, MessageService } from 'primeng/api';
import {MatSelectModule} from '@angular/material/select';
import { MessagesModule } from 'primeng/messages';
import { CapturePhotoDialogComponentComponent } from '../capture-photo-dialog-component/capture-photo-dialog-component.component';
import { ToastModule } from 'primeng/toast';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {  forkJoin, map, Observable, of, startWith, Subject } from 'rxjs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { VisitorConsentModalComponent } from '../../visitor-consent-modal/visitor-consent-modal.component';
import { alphabetValidator,  futureDateValidator, numberValidator, phoneNumberValidator } from '../custom-validators';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { GetIdAndName } from '../../../Models/getIdAndName.interface';

@Component({
  selector: 'app-form-component',
  standalone: true,
  imports: [RouterLink,NgFor,NgIf,FormsModule,ReactiveFormsModule,NgClass,MatAutocompleteModule,MatTooltipModule,
     MatFormFieldModule,MatIconModule,MatInputModule,MatSelectModule,MatDatepickerModule,
     AsyncPipe,MatRadioModule,MatCheckboxModule,NgxCountriesDropdownModule,
   WebcamModule,MessagesModule,ToastModule],
  templateUrl: './form-component.component.html',
  styleUrl: './form-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})



export class FormComponentComponent {

  messages!:Message[] ;
  addvisitorForm: FormGroup;  
  showItemOtherInput: boolean = false;
  showDeviceOption:boolean= false;
  isOtherPurposeSelected = false;
  isOtherDeviceSelected = false;
  isDeviceCarried = false;
  isPlusClicked: boolean = false;
  myControl = new FormControl('');
  deviceControl= new FormControl('')
  filteredPurposes!: Observable<PurposeResponse[]>;
  filteredDevice!: Observable<DeviceResponse[]>
  contacts: string[] = [];
  filteredContacts: string[] = [];
  selectedContact: string[]  | null = null;
  isInputFilled :boolean= false;
  purposes: PurposeResponse[] = [];
  countryCode:string=''
  selectedPurpose: PurposeResponse | undefined ;
  selectedLocation!: string;
  Devices: DeviceResponse[] = [];
  
  selectedDevice: DeviceResponse | null = null;

  permissionStatus : string="";
  camData:any = null;
  capturedImage : any ='';
  trigger : Subject<void> = new Subject();
  showSerialInput: boolean=false;
  Locations: GetIdAndName[] = [];

  constructor(private apiService: DataserviceService,private imageCompress: NgxImageCompressService,
    public dialog: MatDialog,private messageService: MessageService, private datePipe: DatePipe,
    private fb: FormBuilder,private router: Router,private cdr: ChangeDetectorRef) 
  {
    
    this.addvisitorForm = this.fb.group({
      name: ['', [Validators.required,alphabetValidator()]],
      fullNumber:['', Validators.required],
      countryCode:['', Validators.required],
      date: [null, [Validators.required,futureDateValidator()]],
      phoneNumber: ['', [Validators.required,numberValidator(),phoneNumberValidator(() => this.countryCode)]],
      personInContact: ['',[ Validators.required,alphabetValidator()]],
      purposeofvisit: ['', Validators.required],
      purposeofvisitId: ['', Validators.required],
      LocationId:['', Validators.required],
      deviceCarried:['',Validators.required],
      otherDevice:['',Validators.required],
      carryDevice: ['',Validators.required],
      otherPurpose: ['',Validators.required],
      items: this.fb.array([this.createItemFormGroup()]), // Initialize with one item
      policy: ['', Validators.required]
    });

    
    
  }

  
  selectedCountryConfig: IConfig = {
    hideCode: true,
    hideName: true,
    
  };
  countryListConfig: IConfig = {
    hideCode: true,
    
  };

  transformDate(date: Date): string {
    // Use DatePipe to format the date
    date.setHours(0, 0, 0, 0);
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss') ?? '';
  }


  onCountryChange(country: any) {
     console.log("initial",country.dialling_code);  
     this.countryCode = country.dialling_code;      
     this.fullPhoneNumber();
     this.addvisitorForm.get('phoneNumber')?.updateValueAndValidity();
  }
 
  trackByIndex(index: number, item: AbstractControl): number {
  return index;
}

   fullPhoneNumber() {
    const Number = this.addvisitorForm.get('phoneNumber')?.value;
    const fullNumber =this.countryCode+"-"+Number
    console.log(fullNumber);   
    this.addvisitorForm.patchValue({
      fullNumber:fullNumber
           // Clear other purpose field
    });    
  }

  getDeviceCarriedControl(index: number): FormControl {
    const control = this.items.at(index).get('deviceCarried');
    if (isFormControl(control)) {
      return control;
    } else {
      throw new Error('Control is not an instance of FormControl');
    }
  }

  ngOnInit() {
    this.loadVisitPurpose();
    this.loadLocation();
    this.filteredPurposes=this.myControl.valueChanges
    .pipe(startWith(''),map(value => this._filterPurpose(value || '')));


    this.loadDevicesCarried();  
    
  }
  dateFilter = (d: Date | null): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the start of the day
    return d ? d.getTime() >= today.getTime() : false;
  };
  onFocus(index:number){
    this.updateFilteredDevice(index);

  }
  updateFilteredDevice(index: number): void {
    const deviceCarriedControl = this.items.at(index)?.get('deviceCarried');
    
    if (deviceCarriedControl) {
      this.filteredDevice = deviceCarriedControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterDevice(value || ''))
      );
    } else {
      this.filteredDevice = of([]);
    }
  }


openDialog(): void {
  const dialogRef = this.dialog.open(CapturePhotoDialogComponentComponent);

  dialogRef.afterClosed().subscribe((result: WebcamImage | null) => {
    if (result) {
      this.capturedImage = result.imageAsDataUrl;
      // Compress the image
      this.imageCompress.compressFile(this.capturedImage, 0, 50, 50).then(
        (compressedImage) => {
          this.capturedImage = compressedImage;
          console.log("compressed image", this.capturedImage);
          // Store the compressed image
          // this.storeImage(this.capturedImage);
          this.cdr.detectChanges();
        }
      );
    }
  });
  this.capturedImage = this.capturedImage;
}
 loadLocation(){
  this.loadLocationIdAndName().subscribe((response: GetIdAndName[]) => {
    this.Locations = response;
  });
 
 } 
 loadLocationIdAndName(): Observable<GetIdAndName[]> {
  return this.apiService.getLocationIdAndName();
}
 onLocationChange(locationId: string): void {
  // Handle role change
  console.log('Selected Location ID:', locationId);
}

  loadVisitPurpose(){
    this.apiService.getVisitPurpose()
      .subscribe((response :PurposeResponse[]) => {
        console.log(" purpose API Response:", response);
      this.purposes = response;
    });
   }  

   private _filterPurpose(value: string | PurposeResponse): PurposeResponse[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.purposes.filter(option => option.purposeName.toLowerCase().includes(filterValue));
  }   




  onInputFocus() {
    
    this.myControl.setValue(this.myControl.value || ''); 
  }
  displayPurpose(purpose?: any): string  {
    return purpose ? purpose.purposeName : '';
  }
  onPurposeSelected(selectedOption: any): void {
    console.log('Selected purpose:', selectedOption);
    const value = selectedOption.purposeName;
    if (selectedOption.purposeName === 'Other') {
      this.isOtherPurposeSelected = true;
      this.addvisitorForm.patchValue({
        purposeofvisit: value,
        purposeofvisitId: null, 
        otherPurpose: ''       
      });
    } else {
      this.isOtherPurposeSelected = false;
      const value = selectedOption.purposeName;
      const purposeId = selectedOption.purposeId;
  
      
      this.addvisitorForm.patchValue({
        purposeofvisit: value, 
        purposeofvisitId: purposeId,
        otherPurpose: ''      
      });
  
      console.log('Purpose entered:', value);
      console.log('Purpose ID:', purposeId);
    }
  }
  
  
  
  loadDevicesCarried(){
    this.apiService.getDevice()
    .subscribe((response: DeviceResponse[]) => {
      console.log("API Response:", response);
    this.Devices = response;
  });
   }  

  
    private _filterDevice(value: string| DeviceResponse): DeviceResponse []{
      const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
      return this.Devices.filter(device => device.deviceName.toLowerCase().includes(filterValue));
    }

    get items(): FormArray {
      return this.addvisitorForm.get('items') as FormArray;
    }
  
    createItemFormGroup(): FormGroup {
      return this.fb.group({
        deviceCarried: ['', Validators.required],
        DeviceSerialnumber: [''],
        otherDevice: [''],
        otherDeviceCarried:[''],
        isOtherDeviceSelected: [false],
        deviceControl: this.fb.control('')
      });
    }
  
    onCarryDeviceChange(value: number): void {
      if (value === 1) {
        this.showDeviceOption = true; // Explicitly show the device options
        if (this.items.length === 0) {
          this.items.push(this.createItemFormGroup());
        }
      } else if (value === 0) {
        this.showDeviceOption = false; // Explicitly hide the device options
        this.items.clear(); // Clear items if "No"
      }
    }
    
  
    addItem(index: number): void {
      if (this.isInputFilled) {

        if (this.items.length >= 5) {
          this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Cannot add more than 5 devices!' });
 
          console.warn('Cannot add more than 5 items.');
          return;
        }
        this.isPlusClicked = true;        
        // Create a new item form group with empty initial values
        
        const newItemGroup = this.createItemFormGroup();        
        // Push the newly created group to the form array
        
        this.items.push(newItemGroup);    
        // Clear the value of the new form control (this should be redundant but ensures it's empty)
        newItemGroup.get('deviceCarried')?.reset('');   
        
        const deviceControl = new FormControl('');
        newItemGroup.setControl('deviceControl', deviceControl);
        const newIndex = this.items.length - 1;
this.updateFilteredDevice(newIndex);
      }
    }

    removeItem(index: number) {
      this.items.removeAt(index);
      if (this.items.length === 0) {
        this.isPlusClicked = false; // Reset to false when no items are left
      }
      
    }
    
  
    displayDevice(device?: any): string {
      if (!device) {
        return '';
      }
      
      // If the device is 'Other', display 'Other' regardless of its database status
      if (device.deviceName === 'Other') {
        return 'Other';
      }
      
      // Otherwise, return the actual device name
      return device.deviceName;
    }
    
  

    subscribeToSerialNumberChanges(group: FormGroup, index: number): void {
      group.get('DeviceSerialnumber')?.valueChanges.subscribe(serialNumber => {
        if (serialNumber) {
          const deviceCarried = group.get('deviceCarried')?.value;
          console.log(`Device Index: ${index}, Name: ${deviceCarried}, Serial Number: ${serialNumber}`);
        }
      });
    }
   
    onDeviceSelected(selectedOption: any, index: number): void {
      this.isInputFilled = true;
      this.showSerialInput = !this.showSerialInput;
      const items = this.addvisitorForm.get('items') as FormArray;
      const item = items.at(index);
      const deviceCarriedCtrl = item.get('deviceCarried');
  const otherDeviceCtrl = item.get('otherDevice');
  const serialCtrl = item.get('DeviceSerialnumber');
    
      if (selectedOption.deviceName === 'Other') {
        // When "Other" is selected, set a dummy object for deviceCarried
        item.patchValue({
          isOtherDeviceSelected: true,
          DeviceSerialnumber: '', // Clear serial number
          deviceCarried: { deviceId: null, deviceName: 'Other' }, // Keep "Other" as the selected device
        });
        otherDeviceCtrl?.setValidators([Validators.required]);
    serialCtrl?.clearValidators();
    serialCtrl?.setValue(''); 
      } else {
        item.patchValue({
          isOtherDeviceSelected: false, // Reset 'Other' flag
          otherDevice: '', // Clear 'Other' device input
          deviceCarried: { deviceId: selectedOption.deviceId, deviceName: selectedOption.deviceName }, // Update with the selected device
        });
          serialCtrl?.setValidators([Validators.required]);
    otherDeviceCtrl?.clearValidators();
    otherDeviceCtrl?.setValue('');

        console.log('device name:', selectedOption.deviceName);
      console.log('device ID:', items);

      }
      serialCtrl?.updateValueAndValidity();
  otherDeviceCtrl?.updateValueAndValidity();
  deviceCarriedCtrl?.updateValueAndValidity();
    
      this.updateFilteredDevice(index); // Ensure the filtered device list updates
    }
    
    



// Method to log relevant data before submission
logFormDataBeforeSubmit(): void {
  const formData = this.addvisitorForm.value;
  const imageData = this.capturedImage;
  const policy = formData.policy;
  
  console.log("Logging form data before submission:");
  console.log("Form Data:", formData); // Log the entire form data
  console.log("Captured Image:", imageData); // Log the captured image
  console.log("Policy:", policy); // Log the policy confirmation

  const selectedDevice = formData.items
    .filter((item: any) => item.deviceCarried && item.DeviceSerialnumber)
    .map((item: any) => ({
      deviceId: item.deviceCarried.deviceId,
      serialNumber: item.DeviceSerialnumber
    }));

  console.log("Selected Devices:", selectedDevice); // Log the selected devices
}

openPrivacyPolicyDialog(): void {
  this.dialog.open(VisitorConsentModalComponent);
}
isFormValid(): boolean {
  const formData = this.addvisitorForm.value;
  return this.addvisitorForm.valid && formData.policy && this.capturedImage && localStorage.getItem('officeLocationId');
}



onSubmit(): void {
  const formData = this.addvisitorForm.value;
  const imageData = this.capturedImage;
  const formSubmissionMode = "Link";
  const selectedDate = formData.date;
  const formattedDate = this.transformDate(selectedDate);
  const policy = formData.policy;


  if (!policy) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please accept the privacy policy to proceed !' });
    return;
  }
  // Ensure country code is provided
  if (!this.countryCode) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill the country code!' });
    return;
  }

  const Number = this.addvisitorForm.get('phoneNumber')?.value;
  if (!Number) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill the phone number!' });
    return;
  }

  

  const devicesToAdd = formData.items
  .filter((item: any) => item.deviceCarried.deviceName === 'Other' && item.otherDevice) // Filter only items with 'Other' device and a valid otherDevice value
  .map((item: any) => item.otherDevice); // Map to otherDevice values


  const addDevices = (deviceNames: string[]) => {
    const addDeviceObservables = deviceNames.map((deviceName) => this.apiService.addDevice(deviceName));
    return forkJoin(addDeviceObservables);
  };

  const processDeviceCarriedAndAddVisitor = (devices: any[]) => {
    console.log("Received Devices:", devices);
    // console.log("Received Device IDs:");
    // devices.forEach((device, index) => {
    //   console.log(`${index}:${device.id}`);
    // });

    const otherDeviceIds = devices.map((device) => device.id); 
    //console.log("Mapped Device IDs:", otherDeviceIds);

    const addVisitor = (purposeId: any, devices: any[]) => {
      let otherDevicePointer = 0;
      const selectedDevices = formData.items.map((item: any, index: number) => {
        // Use deviceCarried.deviceId if available, otherwise use the corresponding otherDeviceIds item
        let deviceId = item.deviceCarried?.deviceId;

      if (!deviceId && otherDevicePointer < otherDeviceIds.length) {
    // Use the next available device ID from otherDeviceIds
      deviceId = otherDeviceIds[otherDevicePointer];
      otherDevicePointer++; // Move the pointer forward
      }

      
      return {
        deviceId, // It will be a number from the start
        serialNumber: item.DeviceSerialnumber || null,
      };
      });
  

      const visitorPayload = {
      name: formData.name,
      phoneNumber: formData.fullNumber,
      personInContact: formData.personInContact,
      purposeOfVisitId: purposeId,
      officeLocationId: formData.LocationId,
      visitDate: formattedDate,
      SelectedDevice : selectedDevices,
      formSubmissionMode,
      imageData,
      };

      // Validate selectedDevices
const hasInvalidDevice = selectedDevices.some((device:{ deviceId: number; serialNumber: string}, index:number) => {
  const item = formData.items[index];

  const isOtherSelected = item.isOtherDeviceSelected;
  const hasNoOtherDevice = isOtherSelected && !item.otherDevice;
  const hasNoSerial = !isOtherSelected && (!device.serialNumber || device.serialNumber.trim() === '');
  const hasNoDeviceId = !device.deviceId;

  return hasNoOtherDevice || hasNoSerial || hasNoDeviceId;
});

if (hasInvalidDevice) {
  this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required device details correctly!' });
  return;
}



      if (!visitorPayload.name) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Visitor name is missing!' });
        return;
      }
      if (!visitorPayload.phoneNumber) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Phone number is missing!' });
        return;
      }
      if (!visitorPayload.personInContact) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Person in contact is missing!' });
        return;
      }
      if (!visitorPayload.purposeOfVisitId) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Purpose of visit is missing!' });
        return;
      }
      if (!visitorPayload.officeLocationId) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Office location is missing!' });
        return;
      }
      if (!visitorPayload.visitDate) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Visit date is missing!' });
        return;
      }
      if (!visitorPayload.imageData) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Image data is missing!' });
        return;
      }


      this.router.navigate(['/loadingPage']);
      this.apiService.createVisitorAndAddItem(visitorPayload).subscribe(
        (response) => {
          console.log('Visitor added successfully:', response);
          this.router.navigate(['/thankyou']);
        },
        (error) => {
          console.error('Error adding visitor:', error);
        }
      );
    };

    if (formData.purposeofvisitId) {
      // Purpose ID is available, proceed with adding the visitor
      addVisitor(formData.purposeofvisitId, devices);
    } else if (this.isOtherPurposeSelected) {
      // "Other" purpose selected, add the new purpose first
      const otherPurposeValue = formData.otherPurpose;
      this.apiService.addPurpose(otherPurposeValue).subscribe(
        (response: any) => {
          console.log("Other purpose added successfully:", response);
          const newPurposeId = response.id;
          this.addvisitorForm.patchValue({ purposeofvisitId: newPurposeId });
          addVisitor(newPurposeId, devices);
        },
        (error) => {
          console.error('Error adding other purpose:', error);
        }
      );
    }
  };

  // Handle devices and purpose
  if (devicesToAdd.length > 0) {
    addDevices(devicesToAdd).subscribe(
      (responses) => {
        const addedDevices = responses.map((response: any) => ({
          id: response.id,
          name: response.name,

        }));
        console.log("device added",addedDevices);
        processDeviceCarriedAndAddVisitor(addedDevices);
      },
      (error) => {
        console.error('Error adding devices:', error);
      }
    );
  } else {
    processDeviceCarriedAndAddVisitor([]);
  }
}

  }
