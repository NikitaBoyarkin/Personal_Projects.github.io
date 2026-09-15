import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

process.env.BASE_URL ??= "/";