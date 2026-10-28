/* Sample content for the Between Gigs page templates. Every person, photo, rate and review is fictional,
   taken from the client's review prototypes (A Search results, B Profile pages, C Gigster onboarding). */

export interface PortfolioItem { src: string; caption: string }

export interface Person {
  id: string;
  name: string;
  first: string;
  /** The service family, used for search and filtering. */
  service: string;
  /** One line for the search card. */
  tagline: string;
  /** Two search tags. */
  tags: [string, string];
  /** Six "What I can help you with" items. */
  helps: string[];
  area: string;
  miles: number;
  rate: number;
  availability: "this-week" | "next-week";
  about: string;
  tools: string;
  experience: string;
  portfolio: PortfolioItem[];
  /** Pin position on the illustrative map, in percent of its width and height. */
  pin: { x: number; y: number };
}

const img = (id: string, captions: string[]): PortfolioItem[] => captions.map((caption, i) => ({ src: `${id}-${i + 1}.jpg`, caption }));

export const people: Person[] = [
  {
    id: "maya", name: "Maya Chen", first: "Maya", service: "Costume & wardrobe",
    tagline: "Thoughtful alterations, wardrobe edits and custom pieces for everyday life.",
    tags: ["Alterations", "Closet styling"],
    helps: ["Alterations", "Closet styling", "Wardrobe edits", "Custom pieces", "Fit consultations", "Clothing organization"],
    area: "Silver Lake", miles: 3, rate: 45, availability: "this-week",
    about: "I bring a costume-minded eye to the clothes you already love. From thoughtful alterations to a more useful wardrobe, I focus on comfortable fit, practical details and pieces that work for everyday life. We can start with a single garment or work through a closet together.",
    tools: "Sewing and wardrobe tools would be discussed for each project.",
    experience: "Costume and wardrobe skills translated into everyday alterations, personal styling and practical clothing projects.",
    portfolio: img("maya", ["Thoughtful alterations", "Everyday wardrobe styling", "A clearer closet", "Organized essentials"]),
    pin: { x: 46, y: 44 },
  },
  {
    id: "jordan", name: "Jordan Ellis", first: "Jordan", service: "Props & custom builds",
    tagline: "Practical builds, furniture fixes and one-of-a-kind details made with care.",
    tags: ["Furniture repair", "Custom projects"],
    helps: ["Furniture repair", "Custom projects", "Prop fabrication", "Small builds", "Furniture assembly", "Project planning"],
    area: "Echo Park", miles: 4, rate: 55, availability: "this-week",
    about: "I like making useful things and finding practical fixes. My approach combines a prop-builder's resourcefulness with attention to the everyday details of your space. Bring a furniture problem, an idea for a custom piece or a project that needs a creative pair of hands.",
    tools: "Build tools and material needs would be agreed before a project.",
    experience: "Prop-making and hands-on fabrication skills applied to practical furniture fixes and custom projects.",
    portfolio: img("jordan", ["Woodworking details", "Custom prop ideas", "Practical repairs", "One-of-a-kind builds"]),
    pin: { x: 52, y: 58 },
  },
  {
    id: "alex", name: "Alex Rivera", first: "Alex", service: "Decor & event styling",
    tagline: "Inviting spaces and memorable gatherings, from the first idea to the final detail.",
    tags: ["Event styling", "Home refresh"],
    helps: ["Event styling", "Home refresh", "Table styling", "Decor planning", "Room styling", "Finishing touches"],
    area: "Los Feliz", miles: 5, rate: 60, availability: "next-week",
    about: "I help shape inviting spaces and memorable gatherings, from the first idea to the final detail. Whether it's a home refresh or a special event, my approach is thoughtful, practical and focused on how you want the space to feel.",
    tools: "Styling supplies and decor sourcing would be discussed together.",
    experience: "Decor and event-styling skills applied to welcoming homes, gatherings and everyday spaces.",
    portfolio: img("alex", ["Inviting interiors", "Gathering spaces", "Event atmosphere", "A refreshed room", "Natural details", "Art and decor"]),
    pin: { x: 58, y: 30 },
  },
  {
    id: "priya", name: "Priya Shah", first: "Priya", service: "Lighting & atmosphere",
    tagline: "Warm, considered lighting for gatherings, portraits and everyday spaces.",
    tags: ["Event lighting", "Home lighting"],
    helps: ["Event lighting", "Home lighting", "Portrait lighting", "Ambient lighting", "Lighting plans", "Setup planning"],
    area: "Burbank", miles: 6, rate: 60, availability: "this-week",
    about: "Thoughtful light can change the feeling of a room or a gathering. I help explore warm, considered lighting for portraits, events and everyday spaces, with a focus on the mood you want and the practical setup you need.",
    tools: "Lighting equipment and power requirements would be scoped for each project.",
    experience: "Lighting and atmosphere skills translated into home, portrait and event settings.",
    portfolio: img("priya", ["Lighting a scene", "Event atmosphere", "Everyday warmth", "Gathering after dark", "Portrait setup ideas", "Considered spaces"]),
    pin: { x: 40, y: 16 },
  },
  {
    id: "sam", name: "Sam Brooks", first: "Sam", service: "Photography & portraits",
    tagline: "Relaxed portraits, product photos and event moments with a creative eye.",
    tags: ["Portraits", "Product photography"],
    helps: ["Portraits", "Product photography", "Event photography", "Creative portraits", "Image selection", "Shoot planning"],
    area: "Pasadena", miles: 8, rate: 75, availability: "next-week",
    about: "I'm interested in relaxed portraits, thoughtful product images and the moments that make an event feel like yours. A clear plan and a comfortable atmosphere help us focus on making images with a creative eye.",
    tools: "Camera and image-delivery requirements would be confirmed for the project.",
    experience: "Photography and visual-storytelling skills applied to portraits, products and events.",
    portfolio: img("sam", ["Portrait session ideas", "Selecting the story", "Event moments", "Light and setting"]),
    pin: { x: 84, y: 34 },
  },
  {
    id: "morgan", name: "Morgan Lee", first: "Morgan", service: "Set design & spaces",
    tagline: "Inventive backdrops and practical space planning for creative projects.",
    tags: ["Custom backdrops", "Space planning"],
    helps: ["Custom backdrops", "Space planning", "Set concepts", "Display design", "Creative installations", "Layout planning"],
    area: "Glendale", miles: 7, rate: 65, availability: "this-week",
    about: "I bring an inventive approach to backdrops and practical space planning. We can explore how a space needs to work, what it should feel like and the details that bring the idea together, from a small creative setup to a distinctive backdrop.",
    tools: "Drawing, build and installation needs would be planned to suit the space.",
    experience: "Set-design and spatial-planning skills applied to creative backdrops and useful everyday spaces.",
    portfolio: img("morgan", ["A distinctive backdrop", "Fabricated details", "Working with space", "Creative displays", "An installation idea", "Planning the scene"]),
    pin: { x: 66, y: 22 },
  },
];

export const services = people.map((p) => p.service);

export const availabilityLabel = { "this-week": "Available this week", "next-week": "Available next week" } as const;

export const exampleReviews = [
  { quote: "Clear communication and a thoughtful approach to the details.", by: "Sample client 1" },
  { quote: "A creative eye for making the project feel personal.", by: "Sample client 2" },
  { quote: "Practical ideas and a collaborative way of working.", by: "Sample client 3" },
];

export const faqs = (first: string) => [
  { q: "How do I get started?", a: `Send a request with what you need, where and roughly when. ${first} replies to agree the scope, timing and final rate before anything starts.` },
  { q: "What does the hourly rate cover?", a: "The rate is a starting point for time on your project. Materials, travel and the final scope are agreed together before you book." },
  { q: "Where can we work together?", a: `In your home or space across the Los Angeles area. Travel and work mode are agreed for each project.` },
];

/* Onboarding taxonomy (draft, subject to review in the client's prototype). */
export const onSetSkills = ["Wardrobe & costume", "Props", "Set decoration", "Lighting & grip", "Camera", "Hair & makeup", "Art department", "Locations", "Production office"];
export const offSetServices = ["Wardrobe & Personal Styling", "Wardrobe & Laundry Care", "Furniture & Creative Builds", "Beauty & Personal Styling", "Makeup Services", "Hair Styling", "Interior Styling", "Event Styling", "Photography & Portraits", "Lighting Design"];
export const laServiceAreas = ["Eastside", "Downtown", "Hollywood", "Westside", "The Valley", "Pasadena area", "South Bay"];
