import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DataContext } from '../../context/DataContext';

const BarcodeLabelPrint: React.FC = () => {
    const { itemId } = useParams<{ itemId?: string }>();
    const { inventory, companyInfo } = useContext(DataContext);

    // Manually parse quantity from hash URL
    const hash = window.location.hash;
    const quantityString = new URLSearchParams(hash.substring(hash.indexOf('?'))).get('quantity');
    const quantity = quantityString ? parseInt(quantityString, 10) : 1;
    
    const isTest = !itemId;
    const item = isTest 
        ? { id: 'ITEM-123', name: 'صنف اختباري', barcode: '123456789012', salePrice: 99.99 }
        : inventory.find((i: any) => i.id === itemId);

    useEffect(() => {
        if(item) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);

            const handleAfterPrint = () => {
                 setTimeout(() => {
                    window.close();
                 }, 100);
            };
            window.addEventListener('afterprint', handleAfterPrint);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [item]);

    if (!item) {
        return <div className="p-4">لم يتم العثور على الصنف.</div>;
    }

    const generateBarcodeSVG = (text: string) => {
        const lines = [];
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const width = 1 + (charCode % 2);
            const x = i * 3;
            lines.push(<rect key={i} x={x} y="0" width={width} height="30" fill="#000" />);
        }
        return (
            <svg width="100%" height="30" preserveAspectRatio="none">
                {lines}
            </svg>
        );
    };

    const LabelComponent: React.FC<{item: any, companyInfo: any}> = ({ item, companyInfo }) => (
        <div className="label-content" style={{
            width: '50mm',
            height: '25mm',
            padding: '2mm',
            fontFamily: 'Cairo, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
            fontSize: '8pt',
            lineHeight: 1.2,
            overflow: 'hidden',
            backgroundColor: 'white',
            color: 'black',
            pageBreakAfter: 'always',
        }}>
            <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '7pt' }}>{companyInfo.name}</div>
            <div style={{ textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>{item.name}</div>
            <div style={{ width: '90%', margin: '1mm 0' }}>
                {item.barcode && generateBarcodeSVG(item.barcode)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%'}}>
               <div style={{ fontFamily: 'monospace', letterSpacing: '0.5px', fontSize: '7pt' }}>{item.barcode}</div>
               <div style={{ fontWeight: 'bold', fontSize: '9pt'}}>{item.salePrice?.toLocaleString()}</div>
            </div>
        </div>
    );

    return (
        <div id="printable-barcode-label">
            <style>
                {`
                    @media print {
                        @page {
                            size: 50mm 25mm;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #root {
                           padding: 0 !important;
                           margin: 0 !important;
                        }
                        .label-content:last-of-type {
                            page-break-after: auto;
                        }
                    }
                `}
            </style>
             {Array.from({ length: quantity > 0 ? quantity : 1 }).map((_, i) => (
                <LabelComponent key={i} item={item} companyInfo={companyInfo} />
             ))}
        </div>
    );
};

export default BarcodeLabelPrint;