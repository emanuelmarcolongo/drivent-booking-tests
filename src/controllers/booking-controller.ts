import { Request, Response } from "express";
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
    if(error.type === "EnrollmentError") return res.status(404).send(error.message);
    if(error.type === "BodyError") return res.status(400).send(error.message);
    if(error.type === "noCapacity") return res.status(403).send(error.message);
    if(error.type === "undefinedError") return res.status(400).send(error.message);
    
    return res.status(httpStatus.PAYMENT_REQUIRED).send({});
  }
}


export async function getBooking(req: AuthenticatedRequest, res: Response) {
  
    const {userId} = req;

  try {
    

  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  
    const {userId} = req;

  try {
    

  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
  }
}
