import { PrismaClient} from '@prisma/client';
import { Link } from './schema';

const prisma: PrismaClient = new PrismaClient();

export async function createLink (description: string, url: string): Promise<Link>{
    const link = { 
        description: description,
        url: url
    }
    const newLink = await prisma.link.create({
        data: link
    });
    return newLink;
}

export async function getAllLink(): Promise<Link[]|null> {
    
    try { 
        const links = await prisma.link.findMany();
        return links;
    } catch(e) {
        console.log(e);
    }
    finally{
        prisma.$disconnect();
    }
    return null;
}

