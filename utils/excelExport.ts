import * as XLSX from 'xlsx';
import { Record, OrderRecord } from '../types';

export function exportRecordsToExcel(records: Record[], filename?: string) {
    // Preparar datos para Excel
    const data = records.map(record => ({
        'ID': record.id,
        'Referencia': record.reference || '',
        'Longitud': record.length || '',
        'Cantidad': record.quantity || '',
        'Fecha': new Date(record.timestamp).toLocaleString(),
        'Notas': record.notes || '',
    }));

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columnas
    const columnWidths = [
        { wch: 25 }, // ID
        { wch: 15 }, // Referencia
        { wch: 10 }, // Longitud
        { wch: 10 }, // Cantidad
        { wch: 20 }, // Fecha
        { wch: 30 }, // Notas
    ];
    worksheet['!cols'] = columnWidths;

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Etiquetas');

    // Guardar archivo
    const fileName = filename || `etiquetas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

export function exportOrdersToExcel(orders: OrderRecord[], filename?: string) {
    // Preparar datos para Excel
    const data = orders.map(order => ({
        'ID': order.id,
        'Número de Pedido': order.orderNumber || '',
        'Cliente': order.customerName || '',
        'Items': order.items?.length || 0,
        'Fecha': new Date(order.timestamp).toLocaleString(),
        'Estado': order.status || 'Pendiente',
    }));

    // Crear worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columnas
    const columnWidths = [
        { wch: 25 }, // ID
        { wch: 20 }, // Número de Pedido
        { wch: 20 }, // Cliente
        { wch: 8 },  // Items
        { wch: 20 }, // Fecha
        { wch: 12 }, // Estado
    ];
    worksheet['!cols'] = columnWidths;

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // Guardar archivo
    const fileName = filename || `pedidos_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

export function exportAllDataToExcel(records: Record[], orders: OrderRecord[], filename?: string) {
    const workbook = XLSX.utils.book_new();

    // Sheet de etiquetas
    const recordsData = records.map(record => ({
        'ID': record.id,
        'Referencia': record.reference || '',
        'Longitud': record.length || '',
        'Cantidad': record.quantity || '',
        'Fecha': new Date(record.timestamp).toLocaleString(),
        'Notas': record.notes || '',
    }));
    const recordsWorksheet = XLSX.utils.json_to_sheet(recordsData);
    XLSX.utils.book_append_sheet(workbook, recordsWorksheet, 'Etiquetas');

    // Sheet de pedidos
    const ordersData = orders.map(order => ({
        'ID': order.id,
        'Número de Pedido': order.orderNumber || '',
        'Cliente': order.customerName || '',
        'Items': order.items?.length || 0,
        'Fecha': new Date(order.timestamp).toLocaleString(),
        'Estado': order.status || 'Pendiente',
    }));
    const ordersWorksheet = XLSX.utils.json_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Pedidos');

    // Guardar archivo
    const fileName = filename || `delfin_completo_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}
