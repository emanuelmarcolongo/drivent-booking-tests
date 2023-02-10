import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelReposity from "@/repositories/hotel-repository"

async function postBooking(userId: number, roomId: number) {
  
    if (!roomId) throw {type: "BodyError", message: "Your body must contain roomId"};

    
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) {
      throw {type: "EnrollmentError", message: "You don't have enrollment yet"};
    }
    //Tem ticket pago isOnline false e includesHotel true
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  
    if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
      throw {type: "TicketError", message: "You don't have a valid ticket, make sure you have a ticket that's paid, isn't remote and includes hotel"}
    }

    const hotels = await hotelReposity.findHotels();
   
    if (!hotels || hotels.length === 0) {
      throw {type: "HotelError", message: "We don't have any available hotels yet"}
    }

    const room = await bookingRepository.findRoomById(roomId);
    if (!room) {
        throw {type: "RoomNotFound", message: "Room with given ID wasn't found"}
    }

    if (room.capacity === 0) {
      throw {type: "noCapacity", message: "The room you select is out of capacity"}
    }

    const booking = await bookingRepository.postBooking(userId, roomId);
    if (!booking) throw {type: "undefinedError", message: "something went wrong, please try again"}

    
    return booking;
}

async function getUserBooking(userId: number) {

  const userBooking = await bookingRepository.findUserBooking(userId);
  if (!userBooking) throw {type: "noBooking", message: "You don't have any booking yet"}

  return userBooking;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {

  
  const userBooking = await bookingRepository.findUserBooking(userId);
  if (!userBooking) throw {type: "noBooking", message: "You don't have any booking yet"}

  if (!roomId) throw {type: "BodyError", message: "Your body must contain roomId"};

  const room = await bookingRepository.findRoomById(roomId);
    if (!room) throw {type: "RoomNotFound", message: "Room with given ID wasn't found"}

    if (room.capacity === 0)  throw {type: "noCapacity", message: "The room you select is out of capacity"}

    if (userBooking.id !== bookingId) throw {type: "bookingFromAnotherUser", message: "This booking is from another user"}

    const booking = await  bookingRepository.updateBooking(roomId, bookingId);
  

    return booking;

}

const bookingService = {
    postBooking,
    getUserBooking,
    updateBooking
}

export default bookingService;