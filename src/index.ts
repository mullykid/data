import { initApplicationContext } from './Context';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function run() {
    try {
        let applicationContext = await initApplicationContext();

        console.log("Application started.");
    }
    catch (error) {
        console.log("Failed to start the application", error);
    }
}
    
run();
