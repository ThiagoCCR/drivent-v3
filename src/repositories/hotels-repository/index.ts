import { prisma } from "@/config";
import { Hotel, Room } from "@prisma/client";

async function findManyHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function findHotelRooms(hotelId: number): Promise<Hotel>  {
  return prisma.hotel.findFirst({
    where: { 
      id: hotelId 
    },
    include: {
      Rooms: true
    }
  });
}

const hotelsRpository = {
  findManyHotels,
  findHotelRooms
};

export default hotelsRpository;
