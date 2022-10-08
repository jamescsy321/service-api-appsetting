import ApiResStatus from "./apiresstatus";

class BodyResponse{
    private status_code: number;
    private message: string;
    constructor(status_code:number,message:string) {
        this.status_code = status_code;
        this.message = message;
    }

    static success() {
        return new BodyResponse(200, "Success");
    }

    static backupFail() {
        return new BodyResponse(40106, "Backup failed");
    }

    static fieldError() {
        return new BodyResponse(40101, "Field not specified");
    }
    static updateFail() {
        return new BodyResponse(40106,"Update failed");
    }

    static unknownError() {
        return new BodyResponse(40004,"Unknown error");
    }
}

export default ApiResStatus;