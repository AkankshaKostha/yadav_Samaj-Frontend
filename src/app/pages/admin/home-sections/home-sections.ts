import { Component, OnInit } from '@angular/core';
import { HomeSectionService } from '../../../core/home-section';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeSection } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface FilePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-home-sections-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-sections.html',
  styleUrls: ['./home-sections.scss']
})
export class HomeSectionsComponent implements OnInit {
  sections: HomeSection[] = [];
  imageBaseUrl = 'http://yaduvanshisangathan.cloud';

  // For adding multiple banners
  multipleFiles: FilePreview[] = [];
  newBannerTitle = '';
  newBannerDescription = '';

  // For adding a single card
  newCardTitle = '';
  newCardDescription = '';
  newCardFile?: File;
  newCardFilePreview?: string;

  constructor(private service: HomeSectionService, private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections() {
    this.service.getSections().subscribe({
      next: (data) => {
        this.sections = data.map(s => ({
          ...s,
          imageUrl: s.imageUrl ? this.getImageUrl(s.imageUrl) : '',
          imageUrls: s.imageUrls ? s.imageUrls.map(img => this.getImageUrl(img)) : []
        }));
      },
      error: (err) => console.error(err)
    });
  }

  getImageUrl(path: string): string {
    return path.startsWith('http') ? path : `${this.imageBaseUrl}${path}`;
  }

  // Single file for updating existing banner
  onFileChange(event: any, section: HomeSection) {
    const file = event.target.files[0];
    if (file) (section as any).newImage = file;
  }

  // Multiple file upload for new banners
  onMultipleFilesChange(event: any) {
    const files: FileList = event.target.files;
    this.multipleFiles = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.multipleFiles.push({ file, preview: e.target.result });
      };
      reader.readAsDataURL(file);
    });
  }

  removeFile(f: FilePreview) {
    this.multipleFiles = this.multipleFiles.filter(x => x !== f);
  }

  addMultipleBanners() {
    if (!this.multipleFiles.length) {
      Swal.fire({ icon: 'warning', title: 'No Images Selected', text: 'Please select at least one image.' });
      return;
    }
    if (this.newBannerTitle.trim() === '') {
      Swal.fire({ icon: 'warning', title: 'Title Required', text: 'Please enter a title for the banner.' });
      return;
    }

    this.multipleFiles.forEach(f => {
      const formData = new FormData();
      formData.append('type', 'BANNER');
      formData.append('title', this.newBannerTitle);
      if (this.newBannerDescription.trim() !== '') formData.append('description', this.newBannerDescription);
      formData.append('image', f.file);

      this.service.addSection(formData).subscribe({
        next: () => this.loadSections(),
        error: err => console.error(err)
      });
    });

    this.multipleFiles = [];
    this.newBannerTitle = '';
    this.newBannerDescription = '';

    Swal.fire({ icon: 'success', title: 'Banners Added!', text: 'Your banners have been successfully added.' });
  }

  // Add new card
  onCardFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newCardFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.newCardFilePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  addNewCard() {
    if (!this.newCardTitle.trim()) {
      Swal.fire({ icon: 'warning', title: 'Title Required', text: 'Please enter a title for the card.' });
      return;
    }
    if (!this.newCardFile) {
      Swal.fire({ icon: 'warning', title: 'Image Required', text: 'Please select an image for the card.' });
      return;
    }

    const formData = new FormData();
    formData.append('type', 'CARD');
    formData.append('title', this.newCardTitle);
    if (this.newCardDescription.trim() !== '') formData.append('description', this.newCardDescription);
    formData.append('image', this.newCardFile);

    this.service.addSection(formData).subscribe({
      next: () => {
        this.loadSections();
        this.newCardTitle = '';
        this.newCardDescription = '';
        this.newCardFile = undefined;
        this.newCardFilePreview = undefined;
        Swal.fire({ icon: 'success', title: 'Card Added!', text: 'Your new card has been successfully added.' });
      },
      error: err => console.error(err)
    });
  }

  updateHomeSection(section: HomeSection) {
    const formData = new FormData();
    if (section.description) formData.append('description', section.description);
    if ((section as any).newImage) formData.append('file', (section as any).newImage);
    if (section.route) formData.append('route', section.route);

    this.service.updateSection(section.id, formData).subscribe({
      next: () => {
        alert('Section updated successfully!');
        this.loadSections();
        delete (section as any).newImage;
      },
      error: (err) => { console.error(err); alert('Failed to update section.'); }
    });
  }

  deleteSection(id: number) {
    if (confirm('Delete this section?')) {
      this.service.deleteSection(id).subscribe(() => this.loadSections());
    }
  }
}
