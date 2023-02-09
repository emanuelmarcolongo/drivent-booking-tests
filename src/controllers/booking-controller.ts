import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthenticatedRequest } from "@/middlewares";

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  
    const {userId} = req;

  try {
    

  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({});
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
