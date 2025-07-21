// --- Import Book Cover Assets ---
import playingWithFireCover from './assets/Playing with Fire.jpg';
import controlAndReleaseCover from './assets/Control and Release.jpg';
import preludesOfDesireCover from './assets/Beneath the Scholar\'s Veil.jpg';
import enPointeCover from './assets/En Pointe.jpg';
import underSurgicalLightsCover from './assets/Under Surgical Lights.jpg';
import volleyOfTemptationCover from './assets/Volley of Temptation.jpg';
import veilsOfDevotionCover from './assets/Veils of Devotion.jpg';
import boundByBriefsCover from './assets/Bound by Briefs.jpg';

/*
================================================================================
Instructions for Adding a New Book
================================================================================
To add a new book, simply copy one of the book objects below and paste it
as a new element in the `allBooks` array.

Then, update the values for the new book.

Required fields for each book object:
- id: A unique number for this book.
- title: The short title of the book (e.g., "Playing with Fire").
- fullTitle: The complete title used for descriptions.
- description: A paragraph describing the book.
- amazonUrl: The direct link to the book's Amazon page.
- publishDate: The year of publication (e.g., "2024").
- series: The series the book belongs to (e.g., "Dark Academia", "Standalone").
- cover: The imported cover image (import it at the top of this file).
- rating: The book's numerical rating (e.g., 4.5).
- genre: The specific genre of the book. This is used for filtering on the
         Books page. (e.g., "Dark Academia Romance", "Medical Romance").

NOTE on automatically adding books via Amazon link:
The request to add a book simply by pasting an Amazon link is a more complex
feature. It would require a backend service to fetch and parse the data from
Amazon, as doing this directly in the browser is unreliable. The manual
process below is the most straightforward and robust solution for this app.
================================================================================
*/

export const allBooks = [
  {
    id: 1,
    title: "Playing with Fire",
    fullTitle: "Playing with Fire: A Dark-Academia Romance of Power, Desire, and Restraint",
    description: "Delve into Playing with Fire, where the forbidden allure of a professor-student romance ignites amidst the storied halls of Blackwood Academy. A Dark-Academia Romance of Power, Desire, and Restraint that explores the dangerous territory between mentorship and desire.",
    amazonUrl: "https://a.co/d/0PVhMQQ",
    publishDate: "2024",
    series: "Dark Academia",
    cover: playingWithFireCover,
    rating: 4.5,
    genre: "Dark Academia Romance"
  },
  {
    id: 2,
    title: "Control and Release",
    fullTitle: "Control and Release: A Dark Academia Romance",
    description: "Control and Release is an electrifying exploration of forbidden attraction and the intricate dance of power dynamics in academia. When boundaries blur between professor and student, passion becomes a dangerous game of control.",
    amazonUrl: "https://www.amazon.com/Control-Release-Ava-Blackwood-ebook/dp/B0F9FQMW9L",
    publishDate: "2024",
    series: "Dark Academia",
    cover: controlAndReleaseCover,
    rating: 4.3,
    genre: "Dark Academia Romance"
  },
  {
    id: 3,
    title: "Preludes of Desire",
    fullTitle: "Preludes of Desire: A Dark Academia Romance",
    description: "Seventeen-year-old piano prodigy Evelina Moreau has always used her music to control the world around her. But when she meets her enigmatic composition professor, she discovers that some melodies are too dangerous to play.",
    amazonUrl: "https://www.amazon.com/Preludes-Desire-Ava-Blackwood/dp/B0F91VK6GX",
    publishDate: "2024",
    series: "Dark Academia",
    cover: preludesOfDesireCover,
    rating: 4.4,
    genre: "Dark Academia Romance"
  },
  {
    id: 4,
    title: "En Pointe",
    fullTitle: "En Pointe: Romance Edition",
    description: "En Pointe is a story of passion, ambition, and forbidden love set against the backdrop of the illustrious Opéra Garnier. When ballet meets desire, every movement becomes a dance of seduction.",
    amazonUrl: "https://www.amazon.com/En-Pointe-Ava-Blackwood-ebook/dp/B0F9PQNGSG",
    publishDate: "2024",
    series: "Standalone",
    cover: enPointeCover,
    rating: 4.6,
    genre: "Romance"
  },
    {
    id: 7,
    title: "Veils of Devotion",
    fullTitle: "Veils of Devotion: A Dark Academia Romance",
    description: "In the shadowed halls of an ancient seminary, forbidden desires bloom between sacred vows and scholarly pursuits. A tale of spiritual awakening and passionate surrender that challenges the boundaries between devotion and desire.",
    amazonUrl: "https://www.amazon.com/Veils-Devotion-Ava-Blackwood/dp/B0F9VD8K2L",
    publishDate: "2024",
    series: "Dark Academia",
    cover: veilsOfDevotionCover,
    rating: 4.2,
    genre: "Dark Academia Romance"
  },
  {
    id: 5,
    title: "Under Surgical Lights",
    fullTitle: "Under Surgical Lights: A Medical Romance",
    description: "A provocative medical romance exploring power dynamics in the high-stakes world of surgery. When Dr. Sarah Chen meets the enigmatic Chief of Surgery, their professional relationship becomes dangerously personal.",
    amazonUrl: "https://www.amazon.com/Under-Surgical-Lights-Ava-Blackwood/dp/B0F9FTLSC3",
    publishDate: "2024",
    series: "Medical Romance",
    cover: underSurgicalLightsCover,
    rating: 4.2,
    genre: "Medical Romance"
  },
  {
    id: 6,
    title: "Volley of Temptation",
    fullTitle: "Volley of Temptation: A Dark-Academia Sports Romance",
    description: "A dark academia sports romance that explores the tension between competition and desire on the volleyball court. When winning becomes secondary to the game of hearts, every serve is a shot at love.",
    amazonUrl: "https://www.amazon.com/Volley-Temptation-Romance-Ava-Blackwood-ebook/dp/B0F9Q1K3GD",
    publishDate: "2024",
    series: "Dark Academia Sports",
    cover: volleyOfTemptationCover,
    rating: 4.1,
    genre: "Sports Romance"
  },
  {
    id: 8,
    title: "Bound by Briefs",
    fullTitle: "Bound by Briefs: A Legal Romance",
    description: "High-powered attorney Alexandra Stone has never lost a case, but when she faces off against her former law school rival in the courtroom, she discovers that some battles are worth losing. A passionate legal romance where justice and desire collide.",
    amazonUrl: "httpsa.co/d/1pJZNfn",
    publishDate: "2024",
    series: "Legal Romance",
    cover: boundByBriefsCover,
    rating: 4.3,
    genre: "Legal Romance"
  }
];