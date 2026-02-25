import { NextResponse } from "next/server";


let requests: any[] = [
  {
    id: 1,
    name: "Dr. Sara",
    email: "sara@mail.com",
    specialty: "Endocrinologist",
    status: "Pending",
  },
  {
    id: 2,
    name: "Dr. Ahmed",
    email: "ahmed@mail.com",
    specialty: "Radiologist",
    status: "Pending",
  },
];

export async function GET() {
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newRequest = {
    id: Date.now(),
    name: body.name,
    email: body.email,
    status: "Pending",
  };

  requests.push(newRequest);

  return NextResponse.json(newRequest);
}

export async function PUT(req: Request) {
  const body = await req.json();

  requests = requests.map(r =>
    r.id === body.id ? { ...r, status: body.status } : r
  );

  return NextResponse.json({ success: true });
}