'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useReturnsStore, type DriverSlip } from '@/store/returns-store';

export const DriverSlips = () => {
  const { driverSlips } = useReturnsStore();
  const [currentSlipDetails, setCurrentSlipDetails] = useState<DriverSlip | null>(null);

  return (
    <>
      <Card>
          <CardHeader><CardTitle>كشوفات استلام المرتجعات من السائقين</CardTitle></CardHeader>
          <CardContent>
              <Table>
                  <TableHeader><TableRow>
                      <TableHead>رقم الكشف</TableHead><TableHead>السائق</TableHead><TableHead>التاريخ</TableHead><TableHead>عدد الشحنات</TableHead><TableHead>إجراء</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                      {driverSlips.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="h-24 text-center">لا توجد كشوفات بعد.</TableCell></TableRow>
                      ) : (
                          driverSlips.map(slip => (
                              <TableRow key={slip.id}>
                                  <TableCell className="font-mono">{slip.id}</TableCell>
                                  <TableCell>{slip.driverName}</TableCell>
                                  <TableCell>{slip.date}</TableCell>
                                  <TableCell>{slip.itemCount}</TableCell>
                                  <TableCell><Button variant="outline" size="sm" onClick={() => setCurrentSlipDetails(slip)}>عرض التفاصيل</Button></TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
      
      <Dialog open={!!currentSlipDetails} onOpenChange={() => setCurrentSlipDetails(null)}>
          <DialogContent className="max-w-2xl">
               <DialogHeader><DialogTitle>تفاصيل كشف الاستلام {currentSlipDetails?.id}</DialogTitle></DialogHeader>
               <div className="max-h-[60vh] overflow-y-auto">
                  <Table>
                      <TableHeader><TableRow><TableHead>رقم الطلب</TableHead><TableHead>التاجر</TableHead><TableHead>المستلم</TableHead></TableRow></TableHeader>
                      <TableBody>
                          {currentSlipDetails?.orders.map(o => (
                              <TableRow key={o.id}>
                                  <TableCell>{o.id}</TableCell>
                                  <TableCell>{o.merchant}</TableCell>
                                  <TableCell>{o.recipient}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
               </div>
          </DialogContent>
      </Dialog>
    </>
  );
};
