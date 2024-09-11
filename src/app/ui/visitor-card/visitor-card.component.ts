import { NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {  Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { VisitorDataService } from '../../services/VisitorcardServices/VisitorDataServices.service';
@Component({
  selector: 'app-visitor-card',
  standalone: true,
  imports: [NgIf],
  templateUrl: './visitor-card.component.html',
  styleUrl: './visitor-card.component.scss'
})
export class VisitorCardComponent {
  @ViewChild('visitorCard', { static: false }) visitorCard!: ElementRef;
  visitorName: string = '';
  locationId: string = '';
  visitorData: any;
  

  constructor(private router: Router, private visitorDataService: VisitorDataService) {}

  ngOnInit() {
    this.visitorData = {
      name: 'Guest',
      purposeOfVisit: 'General Inquiry',
      dateOfVisit: new Date().toISOString(),  
      imageUrl:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCADwAUADASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAAECBv/EABgQAQEBAQEAAAAAAAAAAAAAAAABEUEx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDhQAAAAEABQBUEAUBUBUUQEVAAUAABFAAFABAAUAAAAAEABQ6IqKgAgcDAAAFRQQFBFRQQAAAAAAAAAAABUUAAABQAQAAAFABAABAAFAEUQABQAQAAAAAAAAAAAAAAFQBRAFAAAABAFBQRQAoIIqACgAAoAiAAAAoAIAAAEAAAwAAAABQAQMVFAAAAAAUAATqgCAICoAAKKiiCAAAAAAAKAAACAAAAAAAAAACoAKAAQFABAABAAAAAAAAAAAAAAAFABAAAAAAAAUAEANAAAFAEUFABAABAAAAAABUAAAABFAAAAAAAAAAAABQAAAQAAFAEVFAQFBQBAEAAAAAAAAAAAAAAAAAAABQAQAAAAAFABBQgAAAIoAAIAoAAAIKgAAAAKAAACAAAAAAAAAAAAAAAACiKAAAAoAIIAAAAAACgz1QAAAAAAAAAAAAAAUAEACAAKAKgAAAKACAAogAAAACAqABQAAAAAAAAAAAAAAAAAAUAEBRAUAAAAAABRAEABQAQFRVEAQAAAAAFABAAUAEAAABQCCAqKAIAoiqACAAoAAgCAAoAIAAAAAAAAACgBEABQAAAAAQAUAAAOICgAigAACeqiggCgAgAAAqiAIAKCAAqAAAABigAgCoAAAoAioqiKIAKiCgKAFQRcAEAABQQAABQAQAFAAFRUQAAFQABQEAAFBFRQBFBFEUFEQVFRQABYIqD/9k='
    }
    this.visitorData = this.visitorDataService.getVisitorData();

    if (!this.visitorData) {
      console.error('No visitor data found. Redirecting to form...');
      this.router.navigate(['/form']);  // Optional: Redirect if no data found
    } else {
      console.log('Visitor Data:', this.visitorData);
    }
  }
  downloadAsPdf() {
    const card = this.visitorCard.nativeElement;
    html2canvas(card, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width/2, canvas.height/2]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width/2, canvas.height/2);
      pdf.save('visitor_card.pdf');
    });
  }

}
