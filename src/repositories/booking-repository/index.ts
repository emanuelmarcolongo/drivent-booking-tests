import { prisma } from "@/config";


async function postBooking(userId: number, roomId: number) {
    return await prisma.booking.create({
        data: {
            userId, 
            roomId,
            updatedAt: new Date().toISOString()
        }
    })

}

async function findRoomById(roomId: number) {
    return await prisma.room.findFirst({
        where: {
            id: roomId
        }
    })
}

async function findUserBooking(userId: number) {
    const booking = await prisma.booking.findFirst({
      select: {
        id: true,
        Room: true
      }, where: {
        userId
      }
    })

    return booking
}


async function updateBooking(roomId: number, bookingId: number ) {

    const booking = await prisma.booking.update({
        where: {id: bookingId},
        data: {
            roomId: roomId
        }
    })
   
    return booking

}

const bookingRepository = {
    postBooking,
    findRoomById,
    findUserBooking,
    updateBooking
}

export default bookingRepository;