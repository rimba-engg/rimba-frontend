export interface Project {
    id: string;
    name: string;
    location: {
      state: string;
      lat: number;
      lng: number;
    };
    details: {
      contractDate: string;
      constructionDate: string;
      commercialOperations?: string;
    };
    description: string;
    imageUrl: string;
    moreInfoUrl: string;
    status: "operational" | "construction" | "planned";
  }
  