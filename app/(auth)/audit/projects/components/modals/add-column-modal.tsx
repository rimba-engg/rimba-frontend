// 'use client';

// import { useState } from 'react';
// import { X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { type ColumnSchema } from '@/lib/types';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// interface AddColumnModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (columnData: ColumnSchema) => void;
// }

// export function AddColumnModal({
//   isOpen,
//   onClose,
//   onSubmit,
// }: AddColumnModalProps) {
//   const [name, setName] = useState('');
//   const [fieldType, setFieldType] = useState<'text' | 'single_select' | 'multi_select' | 'number' | 'date' | 'user'>('text');
//   const [error, setError] = useState('');

//   const handleSubmit = () => {
//     setError('');

//     if (!name.trim()) {
//       setError('Column name is required');
//       return;
//     }

//     onSubmit({
//       name: name.trim(),
//       type: fieldType,
//     });

//     // Reset form
//     setName('');
//     setFieldType('text');
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-background rounded-lg p-6 w-[500px]">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold">Add Custom Column</h2>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onClose}
//           >
//             <X className="w-5 h-5" />
//           </Button>
//         </div>

//         <div className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="name">Column Name</Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter column name"
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="fieldType">Column Type</Label>
//             <Select
//               value={fieldType}
//               onValueChange={setFieldType}
//             >
//               <SelectTrigger id="fieldType">
//                 <SelectValue placeholder="Select field type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="text">Text</SelectItem>
//                 <SelectItem value="number">Number</SelectItem>
//                 <SelectItem value="date">Date</SelectItem>
//                 <SelectItem value="single_select">Single Select</SelectItem>
//                 <SelectItem value="multi_select">Multi Select</SelectItem>
//                 <SelectItem value="user">User</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {error && (
//             <p className="text-sm text-destructive">{error}</p>
//           )}

//           <div className="flex justify-end gap-3">
//             <Button
//               variant="outline"
//               onClick={onClose}
//             >
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit}>
//               Add Column
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }