class ApiResStatus{
    private status :number;
    private body: Object

    constructor(status:number,body:Object) {
        this.status =status;
        this.body=body
    }

    static success() {
        return new ApiResStatus(200, JSON.stringify({status_code:200,message:"success"}));
    }

    static backupFail() {
        return new ApiResStatus(400,JSON.stringify({status_code:200,message:"success"}));
    }

    static fieldError() {
        return new ApiResStatus(400,JSON.stringify({status_code:40101,message:"Field not specified"}));
    }
    static updateFail() {
        return new ApiResStatus(400,JSON.stringify({status_code:40101,message:"Update failed"}));
    }

    static unknownError() {
        return new ApiResStatus(400,JSON.stringify({status_code:40004,message:"Unknown error"}));
    }


}

export default ApiResStatus;