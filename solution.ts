import axios, { type AxiosRequestConfig } from "axios";

export async function callWithRetry<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // TODO: implement retry on 5xx, throw on 4xx. Remember: axios throws on non-2xx by default.
    const res = await axios.get<T>(url, config);
    return res.data;
}
