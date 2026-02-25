/**
 * An application that claims ISCC conformance MUST pass all core functions from the
 * ISCC conformance test suite. The test suite is available as JSON data on
 * [GitHub](https://raw.githubusercontent.com/iscc/iscc-core/master/iscc_core/data.json).
 *
 * Test data is structured as follows:
 * ```json
 * {
 *   "<function_name>": {
 *     "<test_name>": {
 *       "inputs": ["<value1>", "<value2>"],
 *       "outputs": {"value1>", "<value2>"}
 *     }
 *   }
 * }
 * ```
 *
 * Inputs that are expected to be `raw bytes or byte-streams` are embedded as HEX encoded strings
 * in JSON and prefixed with `stream:` or `bytes:` to support automated decoding during
 * implementation testing.
 */

import testData from './data.json';

export interface ConformanceTestEntry {
    test_name: string;
    func_name: string;
    inputs: unknown[];
    outputs: Record<string, unknown>;
}

/**
 * Yield tuples of test data.
 *
 * @returns Array of test data entries [test_name, func_name, inputs, outputs]
 */
export function conformance_testdata(): ConformanceTestEntry[] {
    const data = testData as Record<string, Record<string, { inputs: unknown[];
    outputs: Record<string, unknown> }>>;

    const entries: ConformanceTestEntry[] = [];

    for (const [func_name, tests] of Object.entries(data)) {
        for (const [test_name, test_values] of Object.entries(tests)) {
            // Convert stream and bytes test values
            const converted_inputs = test_values.inputs.map((tv) => {
                if (typeof tv === 'string' && tv.startsWith('stream:')) {
                    const hexStr = tv.slice('stream:'.length);
                    return Buffer.from(hexStr, 'hex');
                }
                if (typeof tv === 'string' && tv.startsWith('bytes:')) {
                    const hexStr = tv.slice('bytes:'.length);
                    return Buffer.from(hexStr, 'hex');
                }
                return tv;
            });

            entries.push({
                test_name,
                func_name,
                inputs: converted_inputs,
                outputs: test_values.outputs,
            });
        }
    }

    return entries;
}
