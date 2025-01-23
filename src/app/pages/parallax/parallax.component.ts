import { Component,OnInit ,NgZone,ElementRef, ViewChild} from '@angular/core';
import { gsap } from 'gsap';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
interface GridCell {
  active: boolean;
}
@Component({
  selector: 'app-parallax',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parallax.component.html',
  styleUrl: './parallax.component.scss'
})
export class ParallaxComponent  {
  constructor(private router: Router, private ngZone: NgZone) {}





goToTodoPage(): void {
  console.log('Button clicked');

  this.ngZone.run(() => {
    this.router.navigate(['/visitorForm']);
  });
}
}