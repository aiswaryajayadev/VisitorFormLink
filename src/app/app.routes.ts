import { Routes } from '@angular/router';
import { VisitorFormComponent } from './pages/visitor-form/visitor-form.component';
import { ThankyouPageComponent } from './pages/thankyou-page/thankyou-page.component';
import { VisitorConsentModalComponent } from './pages/visitor-consent-modal/visitor-consent-modal.component';
import { WelcomepageComponent } from './pages/welcomepage/welcomepage.component';


export const routes: Routes = [
   

    {
       path:'',component:WelcomepageComponent
    },
    {
        path:'privacy',component:VisitorConsentModalComponent
    },
    {
        path:'visitorForm',component:VisitorFormComponent
    },
    {
        path:'thankyou',component:ThankyouPageComponent
    }
    
   

];
