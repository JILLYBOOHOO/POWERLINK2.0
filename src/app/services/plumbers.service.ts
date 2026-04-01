import { Injectable } from '@angular/core';

export interface Review {
  author: string;
  rating: number;
  comment: string;
}

export interface PlumberProfile {
  name: string;
  slug: string;
  specialty: string;
  location: string;
  experience: number;
  rating: number;
  reviewCount: number;
  serviceFee: number;
  availability: string;
  responseTime: string;
  image: string;
  bio: string;
  services: string[];
  reviews: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class PlumbersService {
  readonly plumbers: PlumberProfile[] = [
    {
      name: 'Andre Walker',
      slug: 'andre-walker',
      specialty: 'Emergency leak repair',
      location: 'Kingston',
      experience: 9,
      rating: 4.9,
      reviewCount: 126,
      serviceFee: 95,
      availability: 'Available today',
      responseTime: 'Responds in 10 mins',
      image: 'assets/plumber-andre.svg',
      bio: 'Andre handles urgent plumbing failures for homes and small commercial spaces, with a focus on fast leak isolation and clean repair handoff.',
      services: ['Burst pipe repair', 'Water line diagnosis', 'Emergency callouts'],
      reviews: [
        { author: 'Shanice M.', rating: 5, comment: 'Arrived quickly, explained the issue clearly, and fixed the leak the same visit.' },
        { author: 'David P.', rating: 5, comment: 'Very professional and clean work. Good option for urgent repairs.' },
        { author: 'Marcia L.', rating: 4, comment: 'Fast response and solid repair. Would book again.' }
      ]
    },
    {
      name: 'Nadia Campbell',
      slug: 'nadia-campbell',
      specialty: 'Bathroom fixture installation',
      location: 'Montego Bay',
      experience: 7,
      rating: 4.8,
      reviewCount: 93,
      serviceFee: 120,
      availability: 'Next slot: Tomorrow 9 AM',
      responseTime: 'Responds in 18 mins',
      image: 'assets/plumber-nadia.svg',
      bio: 'Nadia specializes in bathroom upgrades, fixture replacements, and finishing work that needs a neat installation and reliable fit.',
      services: ['Fixture installation', 'Toilet replacement', 'Bathroom plumbing upgrades'],
      reviews: [
        { author: 'Kemar T.', rating: 5, comment: 'Installed our bathroom fixtures perfectly and gave useful product advice.' },
        { author: 'Latoya B.', rating: 5, comment: 'Very tidy work and clear communication throughout the job.' },
        { author: 'Richard S.', rating: 4, comment: 'Great install quality and arrived on time.' }
      ]
    },
    {
      name: 'Rohan Edwards',
      slug: 'rohan-edwards',
      specialty: 'Drain cleaning and maintenance',
      location: 'Spanish Town',
      experience: 5,
      rating: 4.6,
      reviewCount: 71,
      serviceFee: 80,
      availability: 'Available this afternoon',
      responseTime: 'Responds in 22 mins',
      image: 'assets/plumber-rohan.svg',
      bio: 'Rohan focuses on recurring drain issues, blockages, and preventative maintenance for households and rental properties.',
      services: ['Drain cleaning', 'Clog removal', 'Preventive maintenance'],
      reviews: [
        { author: 'Alicia W.', rating: 5, comment: 'Solved a recurring drain problem we had for months.' },
        { author: 'Trevor H.', rating: 4, comment: 'Good value and explained how to avoid the issue returning.' },
        { author: 'Sade C.', rating: 5, comment: 'Efficient, polite, and the drain has been clear ever since.' }
      ]
    }
  ];

  getBySlug(slug: string | null): PlumberProfile | undefined {
    return this.plumbers.find((plumber) => plumber.slug === slug);
  }

  getRelated(profile: PlumberProfile, limit = 2): PlumberProfile[] {
    return this.plumbers
      .filter((plumber) =>
        plumber.slug !== profile.slug &&
        (plumber.location === profile.location || plumber.specialty !== profile.specialty)
      )
      .slice(0, limit);
  }
}
