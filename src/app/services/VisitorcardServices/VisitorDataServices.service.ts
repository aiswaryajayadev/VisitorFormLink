import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisitorDataService {
  private visitorData: any;

  setVisitorData(data: any) {
    this.visitorData = data;
  }

  getVisitorData() {
    return this.visitorData;
  }

  clearVisitorData() {
    this.visitorData = null;  // Optional: Clear data after retrieval if needed
  }
}
