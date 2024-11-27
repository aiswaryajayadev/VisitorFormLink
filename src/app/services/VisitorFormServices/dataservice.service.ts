import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurposeResponse } from '../../Models/IPurposeResponse';
import { map } from 'rxjs/operators';
import { DeviceResponse } from '../../Models/IDeviceResponse';
import { GetIdAndName } from '../../Models/getIdAndName.interface';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DataserviceService {

  constructor(private http:HttpClient) { }
  private url = environment.apiUrl; 
  getLocationIdAndName(): Observable<GetIdAndName[]> {
    const apiUrl = `${this.url}/Location/GetLocationIdAndName`;
    return this.http.get<{ $id: string; $values: GetIdAndName[] }>(apiUrl).pipe(
      map(response => response.$values)
    );
  }  
    
  getVisitPurpose(): Observable<PurposeResponse[]> {
    const apiUrl = `${this.url}/PurposeOfVisit/GetApprovedPurposesIdAndName`;
    return this.http.get<{ $id: string, $values: PurposeResponse[] }>(apiUrl).pipe(
      map(response => response.$values)
    );
  }
      
  getDevice():Observable<DeviceResponse[]>{
    const apiUrl=`${this.url}/Device/GetDeviceIdAndName`;
    return this.http.get<{ $id: string, $values: DeviceResponse[] }>(apiUrl).pipe(
      map(response => response.$values)
    );
   }

   createVisitorAndAddItem(visitor:any):Observable<any[]>{
    console.log("log details",visitor);
    // visitor.OfficeLocationId = 1;
    const apiUrl=`${this.url}/Visitor/CreateVisitor`;
     return this.http.post<any>(apiUrl,visitor);
   }

  
addPurpose(purpose: string): Observable<PurposeResponse> {
  const apiUrl = `${this.url}/PurposeOfVisit/PostPurpose`; // Adjust URL as per your API endpoint

  return this.http.post<PurposeResponse>(apiUrl, { purposeName: purpose });
}
addDevice(device: string ): Observable<DeviceResponse> {
  return this.http.post<DeviceResponse>(`${this.url}Device/PostDevice`, {deviceName:device});
}
   
   

};

