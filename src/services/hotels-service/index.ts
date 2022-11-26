import { notFoundError, forbiddenError, requestError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { Hotel } from "@prisma/client";

async function getHotels(userId: number): Promise<Hotel[]> {
  const valid = await validateUserHotelAvalability(userId);

  if (!valid) {
    throw forbiddenError();
  }

  const hotels = await hotelsRepository.findManyHotels();

  return hotels;
}

async function getHotelRooms(hotelId: number, userId: number): Promise<Hotel> {
  if (!hotelId) {
    throw requestError(400, "BAD_REQUEST");
  }

  const valid = await validateUserHotelAvalability(userId);

  if (!valid) {
    throw forbiddenError();
  }

  const rooms = await hotelsRepository.findHotelRooms(hotelId);

  if(!rooms) {
    throw notFoundError();
  }

  return rooms;
}

async function validateUserHotelAvalability(userId: number): Promise<boolean> {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    return false;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
  if (!ticket || ticket.status !== "PAID" || ticket.TicketType.includesHotel !== true) {
    return false;
  }

  return true;
}

const hotelsService = {
  getHotels,
  getHotelRooms
};

export default hotelsService;
