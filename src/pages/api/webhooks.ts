import { NextApiRequest, NextApiResponse } from "next";

function Webhooks(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "Hello World" });
}

export default Webhooks;