import { Component } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { RedheaderComponentComponent } from "../../layout/parent/redheader-component/redheader-component.component";
@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [MatProgressSpinnerModule, RedheaderComponentComponent],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss'
})
export class LoadingPageComponent {

}
