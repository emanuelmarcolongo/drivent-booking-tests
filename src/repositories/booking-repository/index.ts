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

const bookingRepository = {
    postBooking,
    findRoomById
}

export default bookingRepository;