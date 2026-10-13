/**
 * Where to buy offline (sitemap: Store locator). SAMPLE entries, one per area, so the page
 * has its shape: each is flagged and shows a tag. Replace with real stockists before launch.
 */
export type Store = { id: string; name: string; area: string; city: "Hyderabad" | "Bengaluru"; pincode: string; hours: string; flavours: number; sample?: boolean };

export const STORES: Store[] = [
  { id: "s1", name: "Sample store", area: "Banjara Hills", city: "Hyderabad", pincode: "500034", hours: "8 am to 10 pm", flavours: 7, sample: true },
  { id: "s2", name: "Sample store", area: "Jubilee Hills", city: "Hyderabad", pincode: "500033", hours: "9 am to 11 pm", flavours: 5, sample: true },
  { id: "s3", name: "Sample store", area: "Gachibowli", city: "Hyderabad", pincode: "500032", hours: "8 am to 10 pm", flavours: 7, sample: true },
  { id: "s4", name: "Sample store", area: "Kondapur", city: "Hyderabad", pincode: "500084", hours: "7 am to 11 pm", flavours: 4, sample: true },
  { id: "s5", name: "Sample store", area: "Secunderabad", city: "Hyderabad", pincode: "500003", hours: "9 am to 9 pm", flavours: 6, sample: true },
  { id: "s6", name: "Sample store", area: "Indiranagar", city: "Bengaluru", pincode: "560038", hours: "8 am to 11 pm", flavours: 7, sample: true },
  { id: "s7", name: "Sample store", area: "Koramangala", city: "Bengaluru", pincode: "560034", hours: "8 am to 10 pm", flavours: 5, sample: true },
  { id: "s8", name: "Sample store", area: "HSR Layout", city: "Bengaluru", pincode: "560102", hours: "9 am to 10 pm", flavours: 4, sample: true },
];
