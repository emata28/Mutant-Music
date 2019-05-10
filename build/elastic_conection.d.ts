import { ApiResponse } from "@elastic/elasticsearch";
export declare class elastic_connection {
    private Indices;
    private client;
    constructor();
    private readData;
    getData(pIndex: string): Promise<ApiResponse<any, any>>;
    getInfo(pChannel: number): number[];
    sendData(info: any): Promise<ApiResponse<any, any>>;
    deleteData(pIndex: string): Promise<import("@elastic/elasticsearch/lib/Transport").TransportRequestCallback>;
    createIndex(pIndex: string): Promise<ApiResponse<any, any>>;
}
