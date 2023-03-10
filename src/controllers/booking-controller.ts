import { Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  
    const {userId} = req;
    const {roomId} = req.body;

  try {
    const booking = await bookingService.postBooking(Number(userId), Number(roomId));


    return res.status(201).send({bookingId: booking.id});

  } catch (error) {
    if(error.type === "TicketError") return res.status(403).send(error.message);
    if(error.type === "RoomNotFound") return res.status(404).send(error.message);
    if(error.type === "HotelError") return res.status(404).send(error.message);
    if(error.type === "EnrollmentError") return res.status(403).send(error.message);
    if(error.type === "BodyError") return res.status(400).send(error.message);
    if(error.type === "noCapacity") return res.status(403).send(error.message);
    return res.status(httpStatus.PAYMENT_REQUIRED).send({});
  }
}


export async function getBooking(req: AuthenticatedRequest, res: Response) {
  
    const {userId} = req;

  try {
    
    const userBooking = await bookingService.getUserBooking(userId);

    return res.status(200).send(userBooking);

  } catch (error) {
    if (error.type === "noBooking") return res.status(404).send(error.message);
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const {roomId} = req.body;
    const {userId} = req;
    const {bookingId} = req.params;

  try {
    
    const booking = await bookingService.updateBooking(Number(userId), Number(roomId), Number(bookingId));

    return res.status(200).send({bookingId: booking.id})

  } catch (error) {
    
    if (error.type === "bookingFromAnotherUser") return res.status(401).send(error.message);
    if (error.type === "noBookingFound") return res.status(404).send(error.message);
    if (error.type === "noBooking") return res.status(404).send(error.message);
    if (error.type === "BodyError") return res.status(400).send(error.message);
    if (error.type === "RoomNotFound") return res.status(404).send(error.message);
    if (error.type === "noCapacity") return res.status(403).send(error.message);
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}
