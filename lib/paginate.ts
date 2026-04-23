export async function* paginate<T>(startUrl: string): AsyncGenerator<T> {
    // TODO: GET startUrl; for each page, yield every item in the page's JSON array;
    //       follow Link header rel="next" (may be relative or absolute).
    //       Stop when no rel="next" or Link header missing.
    //       Throw on non-2xx.
    throw new Error("paginate not implemented");
}
