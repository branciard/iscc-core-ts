export const METACODE_BITS: number = 64;
export const META_TRIM_NAME: number = 128;
export const META_NGRAM_SIZE_TEXT: number = 3;
export const META_NGRAM_SIZE_BYTES: number = 4;

/**
 * 
 *     """
    ## MT - MainTypes

    | Uint | Symbol   | Bits | Purpose                                                 |
    |----- |:---------|------|---------------------------------------------------------|
    | 0    | META     | 0000 | Match on metadata similarity                            |
    | 1    | SEMANTIC | 0001 | Match on semantic content similarity                    |
    | 2    | CONTENT  | 0010 | Match on perceptual content similarity                  |
    | 3    | DATA     | 0011 | Match on data similarity                                |
    | 4    | INSTANCE | 0100 | Match on data identity                                  |
    | 5    | ISCC     | 0101 | Composite of two or more ISCC-UNITs with common header  |
    """

 */
export enum MainTypes {
    META = 0,
    SEMANTIC = 1,
    CONTENT = 2,
    DATA = 3,
    INSTANCE = 4,
    ISCC = 5,
    ID = 6,
    FLAKE = 7
}

/*
      ## ST - SubTypes
    
      | Uint | Symbol   | Bits | Purpose                                                 |
      |----- |:---------|------|---------------------------------------------------------|
      | 0    | NONE     | 0000 | For MainTypes that do not specify SubTypes              |
      """
    
      NONE = 0
    */

export enum SubTypes {
    NONE = 0
}

/*
        ## VS - Version
    
        Code Version
    
        | Uint | Symbol   | Bits | Purpose                                                 |
        |----- |:---------|------|---------------------------------------------------------|
        | 0    | V0       | 0000 | Initial Version of Code without breaking changes        |
    
        """
    
        V0 = 0
    
    */

export enum Version {
    V0 = 0
}

export interface IMetaCodeResult {
    iscc: string;
    metahash: string;
    name: string;
    description?: string;
    meta?: string;
    version: number;
}
