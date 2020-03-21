import "reflect-metadata";


export function SocketData(target: Object, propertyKey: string | symbol) {
    Reflect.defineMetadata("custom:anotations:socketData", "SocketData", target, propertyKey);
  }

export function getDecorators(target: any, propertyName: string | symbol): string[] {
    // get info about keys that used in current property
    const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
    const decorators = keys
      // filter your custom decorators
      .filter(key => key.toString().startsWith("custom:anotations"))
      .reduce((values, key) => {
        // get metadata value.
        const currValues = Reflect.getMetadata(key, target, propertyName);
        return values.concat(currValues);
      }, []);
  
    return decorators;
  }