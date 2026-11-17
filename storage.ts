import { db, withRetry } from "./db";
import { services, testimonials, contacts, type Service, type Testimonial, type InsertContact } from "@shared/schema";

export interface IStorage {
  getServices(): Promise<Service[]>;
  getTestimonials(): Promise<Testimonial[]>;
  createContact(contact: InsertContact): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getServices(): Promise<Service[]> {
    return await withRetry(() => db.select().from(services));
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await withRetry(() => db.select().from(testimonials));
  }

  async createContact(contact: InsertContact): Promise<void> {
    await withRetry(() => db.insert(contacts).values(contact));
  }
}

export const storage = new DatabaseStorage();
