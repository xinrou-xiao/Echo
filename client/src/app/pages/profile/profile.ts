import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { response } from 'express';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { FileUploadService } from '../../shared/services/file-upload.service';

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=Echo&background=FFB4A2&color=1F2937';

interface ProfileResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  private readonly fileUploadService = inject(FileUploadService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);  
  private uploadedObjectUrl: string | null = null;

  protected readonly isUploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);
  protected readonly genderOptions = ['Female', 'Male', 'Other'];
  protected readonly stateOptions = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];
  protected readonly cityOptionsByState: Record<string, string[]> = {
    Alabama: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
    Alaska: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
    Arizona: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale'],
    Arkansas: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
    California: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
    Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Boulder'],
    Connecticut: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Norwalk'],
    Delaware: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
    'District of Columbia': ['Washington'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Tallahassee'],
    Georgia: ['Atlanta', 'Savannah', 'Augusta', 'Columbus', 'Macon'],
    Hawaii: ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kahului'],
    Idaho: ['Boise', 'Idaho Falls', 'Twin Falls', 'Pocatello', "Coeur d'Alene"],
    Illinois: ['Chicago', 'Springfield', 'Peoria', 'Naperville', 'Rockford'],
    Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'Bloomington', 'South Bend'],
    Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
    Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Lawrence'],
    Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
    Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
    Maine: ['Portland', 'Bangor', 'Lewiston', 'South Portland', 'Auburn'],
    Maryland: ['Baltimore', 'Annapolis', 'Frederick', 'Rockville', 'Gaithersburg'],
    Massachusetts: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell'],
    Michigan: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Lansing', 'Flint'],
    Minnesota: ['Minneapolis', 'Saint Paul', 'Duluth', 'Rochester', 'Bloomington'],
    Mississippi: ['Jackson', 'Gulfport', 'Biloxi', 'Hattiesburg', 'Tupelo'],
    Missouri: ['Kansas City', 'Saint Louis', 'Springfield', 'Columbia', 'Independence'],
    Montana: ['Billings', 'Missoula', 'Bozeman', 'Great Falls', 'Helena'],
    Nebraska: ['Omaha', 'Lincoln', 'Grand Island', 'Kearney', 'Fremont'],
    Nevada: ['Las Vegas', 'Reno', 'Henderson', 'Carson City', 'Sparks'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Portsmouth'],
    'New Jersey': ['Newark', 'Jersey City', 'Trenton', 'Atlantic City', 'Paterson'],
    'New Mexico': ['Albuquerque', 'Santa Fe', 'Las Cruces', 'Roswell', 'Farmington'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Durham', 'Greensboro', 'Asheville'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'Williston'],
    Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron'],
    Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Stillwater', 'Broken Arrow'],
    Oregon: ['Portland', 'Salem', 'Eugene', 'Bend', 'Medford'],
    Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown', 'Erie'],
    'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'Newport'],
    'South Carolina': ['Charleston', 'Columbia', 'Greenville', 'Myrtle Beach', 'Spartanburg'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Pierre'],
    Tennessee: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Franklin'],
    Texas: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'],
    Utah: ['Salt Lake City', 'Provo', 'Ogden', 'Park City', 'St. George'],
    Vermont: ['Burlington', 'Montpelier', 'Stowe', 'Rutland', 'Bennington'],
    Virginia: ['Richmond', 'Virginia Beach', 'Alexandria', 'Norfolk', 'Charlottesville'],
    Washington: ['Seattle', 'Spokane', 'Tacoma', 'Bellevue', 'Olympia'],
    'West Virginia': ['Charleston', 'Morgantown', 'Huntington', 'Wheeling', 'Parkersburg'],
    Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Appleton', 'Eau Claire'],
    Wyoming: ['Cheyenne', 'Jackson', 'Casper', 'Laramie', 'Gillette']
  };
  protected readonly languageOptions = [
    'English',
    'Mandarin Chinese',
    'Cantonese',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Korean',
    'Hindi',
    'Arabic'
  ];
  protected readonly occupationOptions = [
    'Software Engineer',
    'Product Manager',
    'Designer',
    'Data Scientist',
    'Entrepreneur',
    'Teacher',
    'Student',
    'Healthcare Professional',
    'Finance Professional',
    'Consultant',
    'Researcher',
    'Artist'
  ];
  protected readonly mbtiOptions = [
    'INTJ',
    'INTP',
    'ENTJ',
    'ENTP',
    'INFJ',
    'INFP',
    'ENFJ',
    'ENFP',
    'ISTJ',
    'ISFJ',
    'ESTJ',
    'ESFJ',
    'ISTP',
    'ISFP',
    'ESTP',
    'ESFP'
  ];
  protected readonly heightOptions = Array.from({ length: 41 }, (_, index) => `${150 + index} cm`);
  protected readonly weightOptions = Array.from({ length: 41 }, (_, index) => `${45 + index} kg`);
  protected readonly interestOptions = [
    'Travel',
    'Cooking',
    'Fitness',
    'Reading',
    'Gaming',
    'Music',
    'Photography',
    'Movies',
    'Art & Design',
    'Dancing',
    'Tech & Gadgets',
    'Volunteering',
    'Outdoors & Hiking',
    'Sports',
    'Meditation & Mindfulness'
  ];
  protected readonly personalityOptions = [
    'Introvert',
    'Extrovert',
    'Ambivert',
    'Analytical Thinker',
    'Creative',
    'Adventurous',
    'Empathetic',
    'Strategic Planner'
  ];

  protected readonly preferenceQuestions = [
    {
      label: 'Go-to Comfort Food',
      controlName: 'food',
      placeholder: 'Select your comfort food',
      options: [
        'Pizza or pasta',
        'Asian',
        'Mexican',
        'Desserts or baked treats',
        'Anything vegetarian or vegan'
      ]
    },
    {
      label: 'Your Vibe',
      controlName: 'vibe',
      placeholder: 'Select your vibe',
      options: [
        'Early bird — love slow mornings and sunlight',
        'Night owl — creative or focused after dark',
        'Depends on the day — flexible with my energy'
      ]
    },
    {
      label: 'Favorite Music Type',
      controlName: 'music',
      placeholder: 'Select your music type',
      options: [
        'Pop / K-pop',
        'Indie / Lo-fi',
        'Rock / Metal',
        'R&B / Soul',
        'Classical / Instrumental'
      ]
    },
    {
      label: 'Favorite Movie Type',
      controlName: 'movie',
      placeholder: 'Select your favorite movie type',
      options: [
        'Thrillers or mysteries',
        'Rom-coms',
        'Action or superhero',
        'Slice of life or drama',
        'Documentaries or true stories'
      ]
    },
    {
      label: 'Favorite Weather',
      controlName: 'weather',
      placeholder: 'Select your favorite kind',
      options: [
        'Sunny and warm',
        'Rainy and cozy',
        'Cloudy and calm',
        'Cold and crisp'
      ]
    },
    {
      label: 'Most Valued Qualities in a Friend/Match',
      controlName: 'friendQuality',
      placeholder: 'Select one',
      options: [
        'Kindness',
        'Humor',
        'Honesty',
        'Ambition',
        'Emotional intelligence'
      ]
    }
  ];

  protected readonly picPreferenceOptions = [
    { value: 'google', label: 'Use my Google profile photo' },
    { value: 'upload', label: 'Upload a new profile photo' }
  ];
  protected readonly defaultAvatarUrl = signal<string>(FALLBACK_AVATAR);
  protected readonly profilePhoto = signal<string>(FALLBACK_AVATAR);
  protected readonly yearOptions = Array.from(
    { length: 80 },
    (_, index) => `${new Date().getFullYear() - index}`
  );
  protected readonly monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  protected readonly dayOptions = Array.from({ length: 31 }, (_, index) => `${index + 1}`);

  protected readonly profileForm = this.fb.group({
    name: ['', Validators.required],
    gender: ['', Validators.required],
    birthdayYear: ['', Validators.required],
    birthdayMonth: ['', Validators.required],
    birthdayDay: ['', Validators.required],
    state: ['', Validators.required],
    city: ['', Validators.required],
    language: ['', Validators.required],
    occupation: ['', Validators.required],
    mbti: ['', Validators.required],
    height: ['', Validators.required],
    weight: ['', Validators.required],
    interests: this.fb.control<string[]>([], {
      validators: Validators.required,
      nonNullable: true
    }),

    /* Personal Preferences */
    food: [''],
    vibe: [''],
    music: [''],
    movie: [''],
    weather: [''],
    friendQuality: [''],

    bio: ['', [Validators.required, Validators.maxLength(500)]],
    personality: ['', Validators.required],
    picPreference: ['google', Validators.required],
    picFile: this.fb.control<File | null>(null)
  });

  protected readonly isSaving = signal(false);
  protected readonly showSuccess = signal(false);
  protected readonly formattedBirthday = signal<string | null>(null);
  protected readonly availableCities = signal<string[]>([]);
  protected readonly uploadedFileName = signal<string | null>(null);

  constructor(
    private authService: AuthService
  ) {
    const initialState = this.profileForm.get('state')?.value;
    if (initialState) {
      this.availableCities.set(this.cityOptionsByState[initialState] ?? []);
    }
    this.updateFormattedBirthday();

    if (typeof window !== 'undefined') {
      const storedUserRaw = window.localStorage.getItem('echo.user');
      if (storedUserRaw) {
        try {
          const storedUser = JSON.parse(storedUserRaw) as {
            picUrl?: string;
            photoURL?: string;
            photoUrl?: string;
            name?: string;
          };
          const googlePhoto = storedUser.picUrl || storedUser.photoURL || storedUser.photoUrl;
          if (googlePhoto) {
            this.defaultAvatarUrl.set(googlePhoto);
            this.profilePhoto.set(googlePhoto);
          }
          if (storedUser.name) {
            this.profileForm.patchValue({ name: storedUser.name });
          }
        } catch (error) {
          console.error('Failed to parse stored user profile', error);
        }
      }
    }

    this.destroyRef.onDestroy(() => {
      if (this.uploadedObjectUrl) {
        URL.revokeObjectURL(this.uploadedObjectUrl);
        this.uploadedObjectUrl = null;
      }
    });

    this.loadUserData();
  }

  protected updateFormattedBirthday(): void {
    const { birthdayYear, birthdayMonth, birthdayDay } = this.profileForm.getRawValue();
    if (!birthdayYear || !birthdayMonth || !birthdayDay) {
      this.formattedBirthday.set(null);
      return;
    }

    const month = birthdayMonth.toString().padStart(2, '0');
    const day = birthdayDay.toString().padStart(2, '0');
    this.formattedBirthday.set(`${birthdayYear}-${month}-${day}`);
  }

  protected onBirthdayChange(): void {
    this.updateFormattedBirthday();
  }

  protected onStateChange(event: Event): void {
    const stateControl = this.profileForm.get('state');
    const cityControl = this.profileForm.get('city');
    if (!stateControl || !cityControl) {
      return;
    }

    const selectedState = (event.target as HTMLSelectElement).value;
    if (!selectedState) {
      stateControl.setValue('');
      this.availableCities.set([]);
      cityControl.setValue('');
      cityControl.markAsPristine();
      cityControl.markAsUntouched();
      cityControl.updateValueAndValidity();
      return;
    }
    stateControl.setValue(selectedState);
    stateControl.markAsDirty();
    stateControl.markAsTouched();
    cityControl.setValue('');
    cityControl.markAsPristine();
    cityControl.markAsUntouched();
    cityControl.updateValueAndValidity();
    const cities = this.cityOptionsByState[selectedState] ?? [];
    this.availableCities.set(cities);
  }

  protected onPicPreferenceChange(event: Event): void {
    const preference = (event.target as HTMLInputElement).value;
    const preferenceControl = this.profileForm.get('picPreference');
    const picFileControl = this.profileForm.get('picFile');
    if (!preferenceControl || !picFileControl) {
      return;
    }

    preferenceControl.markAsDirty();
    preferenceControl.markAsTouched();

    if (preference === 'upload') {
      picFileControl.addValidators(Validators.required);
    } else {
      picFileControl.removeValidators(Validators.required);
      picFileControl.setValue(null);
      this.uploadedFileName.set(null);
      picFileControl.markAsPristine();
      picFileControl.markAsUntouched();
      if (this.uploadedObjectUrl) {
        URL.revokeObjectURL(this.uploadedObjectUrl);
        this.uploadedObjectUrl = null;
      }
      this.profilePhoto.set(this.defaultAvatarUrl());
    }
    picFileControl.updateValueAndValidity();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    const picFileControl = this.profileForm.get('picFile');
    if (!picFileControl) {
      return;
    }

    picFileControl.setValue(file);
    picFileControl.markAsDirty();
    picFileControl.markAsTouched();
    this.uploadedFileName.set(file ? file.name : null);
    picFileControl.updateValueAndValidity();

    if (this.uploadedObjectUrl) {
      URL.revokeObjectURL(this.uploadedObjectUrl);
      this.uploadedObjectUrl = null;
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      this.uploadedObjectUrl = objectUrl;
      this.profilePhoto.set(objectUrl);
    } else {
      this.profilePhoto.set(this.defaultAvatarUrl());
    }
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return Boolean(control && control.invalid && control.touched);
  }

  protected async onSubmit(): Promise<void> {
    const user = this.authService.profile();
    if (!user || !user._id) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.uploadError.set(null);

    try {
      let profilePictureUrl: string | null = null;

      const picFile = this.profileForm.get('picFile')?.value;
      const picPreference = this.profileForm.get('picPreference')?.value;

      if (picPreference === 'upload' && picFile) {
        profilePictureUrl = await this.uploadProfilePicture(picFile);
      }

      const profilePayload = this.prepareProfilePayload(profilePictureUrl);
      await this.submitProfileData(user._id, profilePayload);

      this.showSuccess.set(true);

      setTimeout(() => {
      this.showSuccess.set(false);
      this.router.navigate(['/view_profile', user._id]);
    }, 1000);
    } catch (error) {
      console.error('Submit error:', error);
      this.uploadError.set('Failed to upload profile picture');
    } finally {
      this.isSaving.set(false);
    }
  }

  private async uploadProfilePicture(file: File): Promise<string> {
    this.isUploading.set(true);

    try {
      const presignedResponse = await this.fileUploadService
        .getPresignedUrl(file.name, file.type)
        .toPromise();

      if (!presignedResponse?.success) {
        throw new Error('Failed to get upload URL');
      }

      await this.fileUploadService
        .uploadToS3(presignedResponse.presignedUrl, file)
        .toPromise();

      return presignedResponse.fileUrl;
    } catch (error) {
      console.error('picture upload failed:', error);
      throw new Error('Failed to upload profile picture');
    } finally {
      this.isUploading.set(false);
    }
  }

  private prepareProfilePayload(profilePictureUrl: string | null): any {
    const {
      birthdayYear,
      birthdayMonth,
      birthdayDay,
      state,
      city,
      interests,
      picPreference,
      picFile,
      ...rest
    } = this.profileForm.getRawValue();

    const birthday = new Date(
      Number(birthdayYear),
      Number(birthdayMonth) - 1,
      Number(birthdayDay)
    );

    const getGooglePhotoUrl = (): string | null => {
      if (typeof window !== 'undefined') {
        try {
          const storedUserRaw = window.localStorage.getItem('echo.user');
          if (storedUserRaw) {
            const storedUser = JSON.parse(storedUserRaw) as {
              picUrl?: string;
              photoURL?: string;
              photoUrl?: string;
            };
            return storedUser.picUrl || storedUser.photoURL || storedUser.photoUrl || null;
          }
        } catch (error) {
          console.error('Failed to get Google photo from localStorage:', error);
        }
      }
      return null;
    };

    const googlePhotoUrl = getGooglePhotoUrl();

    return {
      ...rest,
      interests,
      location: {
        state,
        city
      },
      birthday: birthday.toISOString().split('T')[0],
      profilePicture: profilePictureUrl ? {
        source: 'uploaded',
        url: profilePictureUrl,
        fileName: picFile?.name ?? null
      } : picPreference === 'google' ? {
        source: 'google-default',
        url: googlePhotoUrl,
        fileName: 'google-profile-picture'
      } : {
        source: 'none',
        url: null,
        fileName: null
      }
    };
  }

private submitProfileData(userId: string, profileData: any): Promise<void> {
  return new Promise((resolve, reject) => {
    this.http
      .put<ProfileResponse>(`${environment.apiUrl}/user/${userId}`, profileData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.message || 'Save failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
  });
}

  protected isInterestSelected(interest: string): boolean {
    const currentInterests = this.profileForm.get('interests')?.value || [];
    return currentInterests.includes(interest);
  }

  protected onInterestChange(event: Event, interest: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentInterests = this.profileForm.get('interests')?.value || [];

    let updatedInterests: string[];

    if (isChecked) {
      updatedInterests = [...currentInterests, interest];
    } else {
      updatedInterests = currentInterests.filter(i => i !== interest);
    }

    this.profileForm.patchValue({ interests: updatedInterests });
    this.profileForm.get('interests')?.markAsTouched();
  }

  private loadUserData(): void {
    const user = this.authService.profile();
    if (!user || !user._id) {
      console.log('No user found');
      return;
    }

    this.http.get<ProfileResponse>(`${environment.apiUrl}/user/${user._id}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            console.log('User data loaded:', response.data);
            this.populateForm(response.data);
          }
        },
        error: (error) => {
          console.error('Failed to load user data:', error);
        }
      });
  }

  private populateForm(userData: any): void {
    try {
      this.profileForm.patchValue({
        name: userData.name || '',
        gender: userData.gender || '',
        language: userData.language || '',
        occupation: userData.occupation || '',
        mbti: userData.mbti || '',
        height: userData.height || '',
        weight: userData.weight || '',
        bio: userData.bio || '',
        personality: userData.personality || '',
        interests: userData.interests || []
      });

      this.profileForm.patchValue({
        food: userData.food || '',
        vibe: userData.vibe || '',
        music: userData.music || '',
        movie: userData.movie || '',
        weather: userData.weather || '',
        friendQuality: userData.friendQuality || ''
      });

      if (userData.birthday) {
        const birthday = new Date(userData.birthday);
        this.profileForm.patchValue({
          birthdayYear: birthday.getFullYear().toString(),
          birthdayMonth: (birthday.getMonth() + 1).toString(),
          birthdayDay: birthday.getDate().toString()
        });
        this.updateFormattedBirthday();
      }

      if (userData.state) {
        this.profileForm.patchValue({
          state: userData.state || '',
          city: userData.city || ''
        });

        if (userData.state) {
          this.availableCities.set(this.cityOptionsByState[userData.state] || []);
        }
      }

      if (userData.picUrl) {
        const isGooglePhoto = userData.picUrl.includes('googleusercontent.com') ||
          userData.picUrl.includes('google');

        this.profileForm.patchValue({
          picPreference: isGooglePhoto ? 'google' : 'upload'
        });

        if (isGooglePhoto) {
          this.defaultAvatarUrl.set(userData.picUrl);
          this.profilePhoto.set(userData.picUrl);
        }
      }
    } catch (error) {
      console.error('Error populating form:', error);
    }
  }
}
