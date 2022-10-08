import {AzureFunction, Context, HttpRequest} from "@azure/functions"
import {BlobClient, BlobServiceClient, newPipeline, Pipeline, StorageSharedKeyCredential} from "@azure/storage-blob";
import {Buffer} from "buffer";
import apiResStatus from "./apiresstatus";
import bodyParser  from  "body-parser";
import express from "express";
let app =express();


const client: BlobClient = new BlobClient(process.env["APP_CONNECTION_STRING"]
    , "superapp-config-devops", "appVersion.json")

const account: string = process.env["APP_ACCOUNT_NAME"];

const sharedKeyCredential: StorageSharedKeyCredential = new StorageSharedKeyCredential(process.env["APP_ACCOUNT_NAME"], process.env["APP_ACCOUNT_KEY"]);

const pipeline: Pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient: BlobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, pipeline);


const updateAppVersion: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    let responseData;
    let jsonFile = await client.downloadToBuffer();

    responseData = await updateJson(jsonFile, req);
    context.res = responseData;
   
};


async function updateJson(json, req) {
    const jsonContent: appVersion = JSON.parse(json);
    try {
        //備份jsonFile
        await backupFile(jsonContent)
    } catch (e) {
        return apiResStatus.backupFail();
    }
    const except = ["announcement", "hostPin", "aa_tracking"];
    bodyParser.json();
    const queryContent = req.body;

    //針對query參數內容與json內容比對及更新
    for (let queryContentKey in queryContent) {
        if (jsonContent.hasOwnProperty(queryContentKey) && !except.includes(queryContentKey)) {
            jsonContent[queryContentKey] = queryContent[queryContentKey];

        } else {
            return apiResStatus.fieldError();
        }
    }
    try {
        //上傳更新檔案
        await uploadFile(jsonContent)
    } catch (err) {
        return apiResStatus.updateFail();
    }

    // console.log("success-responseDatas");
    return apiResStatus.success();

}

async function backupFile(content?: Object) {

    const containerClient = blobServiceClient.getContainerClient("superapp-config-devops/backup");
    const time = new Date();
    const currentTime: string = time.toISOString().split('T')[0] + "-" + time.getHours() + "-" + time.getMinutes() + "-" + time.getSeconds();
    const blobName: string = "appVersion-" + currentTime + ".json";
    try {
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const buffer = Buffer.from(JSON.stringify(content))
        const options = {blobHTTPHeaders: {blobContentType: "application/json"}}
        const uploadBlobResponse = await blockBlobClient.upload(buffer, content.toString().length, options);
        // console.log(`backup  blob successfully`, uploadBlobResponse.requestId);
    } catch (err) {
        return apiResStatus.backupFail();
    }
}

async function uploadFile(content: appVersion) {

    const containerClient = blobServiceClient.getContainerClient("superapp-config-devops");

    const blobName = "appVersion" + ".json";
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const options = {blobHTTPHeaders: {blobContentType: "application/json"}}
    const buffer = Buffer.from(JSON.stringify(content))
    const uploadBlobResponse = await blockBlobClient.upload(buffer, content.toString().length, options);
    // console.log(`Upload  blob successfully`, uploadBlobResponse.requestId);
}

interface appVersion {
    androidVersion: string
    iosVersion: string
    message: string
    apiReduceErrorText: string
    force: boolean
    reminder_update_enable: boolean
    apiReduce: boolean
    fullScreenCampaign: boolean
    announcement: Object
    hostPin: [Object]
    aa_tracking: Object
}


export default updateAppVersion;
