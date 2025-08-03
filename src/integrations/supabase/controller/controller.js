import messageS from "../Models/Messages.js";

export const getChats = async (req, res) => {
  const groupId = req.params.id;
  console.log("the grp is ", groupId);
  try {
    const msg = await messageS.find(
      { Group: groupId },
      { Message: 1, _id: 0, Sender: 1 }
    );
    res.status(200).json({ status: "✅", message: msg });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "❌", error: error });
  }
};

export const postChat = async (req, res) => {
  try {
    const messageToBeSaved = await messageS.create(req.body);
    res.status(200).json({ status: "✅", message: messageToBeSaved });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "❌", error: "couldnt save the mesage " });
  }
};
