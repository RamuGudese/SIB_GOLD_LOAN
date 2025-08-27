import { Routes } from '@angular/router';
import { CertificateComponent } from './pages/certificate/certificate.component';
import { ApplicationComponent } from './pages/application/application.component';

export const routes: Routes = [
     {
            path:'',
            component: ApplicationComponent
    },
    {
    path: 'c',
    component : CertificateComponent
     },
];
