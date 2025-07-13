


organizar pdf con la configuracion del spa



1. ¿Dónde cambiar la configuración de la información del PDF de las facturas?
La información estática de la factura (como el nombre del SPA, dirección, teléfono, email) está directamente codificada en el InvoiceService del backend.

Archivo: backend-spa/src/invoice/invoice.service.ts

Sección a modificar: Busca el método generateInvoicePdf (y generateCombinedInvoicePdf si quieres que la información sea consistente en ambas).

LOGO

voy en la fase 2. tengo algunas dudas antes de continuar. 1. que pasa con mi base de datos que ya tiene registros de prueba, y no quiero que esten cuando despliegue, como borro todo o creo una nueva base de datos o como funciona el synchronize que actualmente lo tengo en true, 2. no quiero un plan free, siento que mi aplicacion es muy robusta y necesitara buen espacio y velocidad.