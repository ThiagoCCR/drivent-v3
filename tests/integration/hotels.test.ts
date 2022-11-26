import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken, generateTicketTypeByHotel } from "../helpers";
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket, createHotel } from "../factories";
import { createRoom } from "../factories/rooms-factory";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
 
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  describe("when token is valid", () => {
    it("should respond with status 403 when there is no enrollment for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there is no ticket for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there is no paid ticket for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket does not includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await generateTicketTypeByHotel(false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  
    it("should respond with status 200 and hotels data when there is a paid hotel ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await generateTicketTypeByHotel(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      ]));
    });
  });
});

describe("GET /hotels/:hotelId", () => {
  let hotelParams = 1;

  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get(`/hotels/${hotelParams}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
  
    const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
 
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
    const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 when there is no enrollment for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there is no ticket for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there is no paid ticket for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when ticket does not includes hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await generateTicketTypeByHotel(false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when no hotel is find with the given id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  
    it("should respond with status 200 and hotel rooms when there is a paid hotel ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await generateTicketTypeByHotel(true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      await createRoom(hotel.id);
      hotelParams = hotel.id;

      const response = await server.get(`/hotels/${hotelParams}`).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        Rooms: expect.arrayContaining([expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
