import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface YearSelectorProps {
    value: string
    onValueChange: (value: string) => void
    startYear?: number
    endYear?: number
}

export function YearSelector({
    value,
    onValueChange,
    startYear = 1900,
    endYear = new Date().getFullYear()
}: YearSelectorProps) {
    const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => endYear - i
    )

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
                {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}