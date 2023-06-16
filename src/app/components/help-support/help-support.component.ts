import { Component, Renderer2 } from '@angular/core';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.css'],
})
export class HelpSupportComponent {
  email: string = '';
  subject: string = '';
  message: string = '';

  constructor(
    private contactService: ContactService,
    private renderer: Renderer2
  ) {}

  onSubmit(form: any): void {
    const emailInput = document.getElementById('email');
    if (form.valid) {
      this.renderer.removeClass(emailInput, 'border-red-500');
      const data = {
        email: this.email,
        subject: this.subject,
        message: this.message,
      };

      this.contactService
        .addMessage(data)
        .then(() => {
          this.showToast('toast-success');
          form.reset();
        })
        .catch((error) => {
          console.error('Error submitting form:', error);
          this.showToast('toast-danger');
        });
    } else {
      this.renderer.addClass(emailInput, 'border-red-500');
    }
  }

  showToast(toastId: string): void {
    const toastElement = document.getElementById(toastId);
    this.renderer.removeClass(toastElement, 'hidden');

    setTimeout(() => {
      this.renderer.addClass(toastElement, 'hidden');
    }, 5000);
  }

  removeErrorClass(elementId: string): void {
    const element = document.getElementById(elementId);
    this.renderer.removeClass(element, 'border-red-500');
  }
}
