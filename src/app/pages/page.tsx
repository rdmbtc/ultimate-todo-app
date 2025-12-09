"use client"

import { FileText, Folder, MoreHorizontal } from "lucide-react"

export default function PagesPage() {
    const files = [
        { name: "Project Requirements.pdf", type: "PDF", size: "2.4 MB", date: "2 mins ago" },
        { name: "Design Assets", type: "Folder", size: "12 items", date: "1 hour ago" },
        { name: "Meeting Notes.docx", type: "DOCX", size: "14 KB", date: "Yesterday" },
        { name: "Budget 2024.xlsx", type: "XLSX", size: "45 KB", date: "3 days ago" },
    ]

    return (
        <main className="flex-1 p-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Pages</h1>
                <p className="text-muted-foreground">Your documents and files.</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl flex-1 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer">
                        <Folder className="h-8 w-8 text-blue-500" />
                        <span className="font-medium">All Files</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl flex-1 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer">
                        <FileText className="h-8 w-8 text-orange-500" />
                        <span className="font-medium">Recent</span>
                    </div>
                </div>

                <div className="p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-muted-foreground">
                                <th className="pb-4 font-medium">Name</th>
                                <th className="pb-4 font-medium">Type</th>
                                <th className="pb-4 font-medium">Size</th>
                                <th className="pb-4 font-medium">Modified</th>
                                <th className="pb-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file, i) => (
                                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <td className="py-4 flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                                            {file.type === 'Folder' ? <Folder className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-gray-500" />}
                                        </div>
                                        <span className="font-medium">{file.name}</span>
                                    </td>
                                    <td className="py-4 text-sm text-muted-foreground">{file.type}</td>
                                    <td className="py-4 text-sm text-muted-foreground">{file.size}</td>
                                    <td className="py-4 text-sm text-muted-foreground">{file.date}</td>
                                    <td className="py-4 text-right">
                                        <button className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
