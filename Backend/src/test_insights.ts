import dotenv from 'dotenv';
import path from 'path';
import { getCaseInsights } from '../../AI/engine/insights';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTest() {
    try {
        console.log("Running getCaseInsights for case: c1");
        const result = await getCaseInsights("c1");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (err: any) {
        console.error("Test failed:", err.message);
    }
}

runTest();
