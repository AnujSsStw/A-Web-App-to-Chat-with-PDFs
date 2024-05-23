import axios from "axios";
import { ClientUploadedFileData } from "uploadthing/types";

export const sendToQueue = async (
  title: string,
  description: string,
  res: ClientUploadedFileData<{
    uploadedBy: string | undefined;
  }>[]
) => {
  axios.defaults.baseURL = "http://localhost:6969";
  console.log(axios.defaults.baseURL);
  const response = await axios.post("/api/create", {
    title,
    description,
    pdf: res[0].url,
    userId: res[0].serverData.uploadedBy,
  });
  console.log("Response: ", response);
};
