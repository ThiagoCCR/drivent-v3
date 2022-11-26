import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;
  try {
    const rooms = await hotelsService.getHotelRooms(Number(hotelId), userId);

    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    if(error.name === "RequestError") {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    } else if (error.name === "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    } else {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
