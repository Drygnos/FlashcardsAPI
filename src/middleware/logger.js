const logger = (req, res, next) => {
    const { method, host, path } = req;
    const time = new Date().toLocaleTimeString('fr-FR');

    console.log(`${time} : ${method} - ${host} - ${path}`);
    next();
}

export default logger;