import React from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@render/components/ui/table'
import type { IStream } from '@main/ws-engine/ws-engine'

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface IStreamsTableProps {
  streams: IStream[]
}

function StreamsTable({ streams }: IStreamsTableProps) {
  return (
    <Table>
      <TableCaption>A list of account streams.</TableCaption>
      <TableHeader>
        <TableRow>
          {/* className="w-[100px]" */}
          <TableHead>Name</TableHead>
          <TableHead>Blog URL</TableHead>
          <TableHead>Stream status</TableHead>
          <TableHead className="text-center">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {streams.map(stream => (
          <TableRow key={stream.name}>
            <TableCell className="font-medium">{stream.name}</TableCell>
            <TableCell>{stream.blogUrl}</TableCell>
            <TableCell>{capitalizeFirstLetter(stream.streamStatus)}</TableCell>
            <TableCell className="text-center">{stream.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default StreamsTable
