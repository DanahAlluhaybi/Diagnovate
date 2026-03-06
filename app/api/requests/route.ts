import { NextResponse } from "next/server";


let requests: any[] = [
];


export async function GET() {
  return NextResponse.json(requests); // إرجاع الطلبات من الذاكرة
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