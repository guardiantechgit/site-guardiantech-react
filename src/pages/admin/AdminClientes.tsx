import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientLogos, ClientLogo } from "@/hooks/useClientLogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, GripVertical, Loader2, ImageIcon, ExternalLink } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRowProps {
  logo: ClientLogo;
  index: number;
  onToggle: (logo: ClientLogo) => void;
  onDelete: (logo: ClientLogo) => void;
}

const SortableRow = ({ logo, index, onToggle, onDelete }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: logo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={!logo.active ? "opacity-50" : ""}
    >
      <TableCell>
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-1"
          >
            <GripVertical size={14} className="text-muted-foreground" />
          </button>
          <span className="text-xs text-muted-foreground">{index + 1}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="h-[60px] w-[88px] flex items-center justify-center bg-muted/30 rounded">
          <img
            src={logo.image_url}
            alt={logo.name}
            className="h-[60px] w-[88px] object-contain"
          />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        {logo.url ? (
          <a
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {logo.name}
            <ExternalLink size={12} />
          </a>
        ) : (
          logo.name
        )}
      </TableCell>
      <TableCell className="text-center">
        <Switch checked={logo.active} onCheckedChange={() => onToggle(logo)} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir logo?</AlertDialogTitle>
                <AlertDialogDescription>
                  O logo de "{logo.name}" será removido permanentemente do site.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(logo)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

const AdminClientes = () => {
  const { data: logos = [], isLoading } = useClientLogos(false);
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["client-logos"] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/png")) {
      toast({ title: "Formato inválido", description: "Envie apenas arquivos PNG.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setNewFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!newFile || !newName.trim()) {
      toast({ title: "Preencha o nome e selecione uma imagem.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = newFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("client-logos")
        .upload(fileName, newFile, { contentType: newFile.type });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("client-logos").getPublicUrl(fileName);
      const maxOrder = logos.length > 0 ? Math.max(...logos.map((l) => l.sort_order)) : 0;

      const { error: insertErr } = await supabase.from("client_logos").insert({
        name: newName.trim(),
        url: newUrl.trim(),
        image_url: urlData.publicUrl,
        sort_order: maxOrder + 1,
      });
      if (insertErr) throw insertErr;

      toast({ title: "Logo adicionado com sucesso!" });
      setDialogOpen(false);
      setNewName("");
      setNewUrl("");
      setNewFile(null);
      setPreview(null);
      invalidate();
    } catch (err: any) {
      toast({ title: "Erro ao adicionar", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleToggle = async (logo: ClientLogo) => {
    const { error } = await supabase
      .from("client_logos")
      .update({ active: !logo.active })
      .eq("id", logo.id);
    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      invalidate();
    }
  };

  const handleDelete = async (logo: ClientLogo) => {
    if (logo.image_url.includes("client-logos")) {
      const path = logo.image_url.split("/client-logos/")[1];
      if (path) {
        await supabase.storage.from("client-logos").remove([path]);
      }
    }
    const { error } = await supabase.from("client_logos").delete().eq("id", logo.id);
    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Logo excluído." });
      invalidate();
    }
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const sorted = [...logos].sort((a, b) => a.sort_order - b.sort_order);
      const oldIndex = sorted.findIndex((l) => l.id === active.id);
      const newIndex = sorted.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(sorted, oldIndex, newIndex);

      // Optimistically update cache
      queryClient.setQueryData(["client-logos", false], reordered.map((l, i) => ({ ...l, sort_order: i })));

      // Persist all new sort_orders
      const updates = reordered.map((l, i) =>
        supabase.from("client_logos").update({ sort_order: i }).eq("id", l.id)
      );
      await Promise.all(updates);
      invalidate();
    },
    [logos]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={28} />
      </div>
    );
  }

  const sorted = [...logos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Logos de Clientes</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os logos exibidos no site. Arraste para reordenar.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Logo de Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do cliente</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Empresa XYZ" />
              </div>
              <div>
                <Label>URL do site ou rede social</Label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://exemplo.com" />
              </div>
              <div>
                <Label>Imagem do logo</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Formato: PNG · Dimensão recomendada: 176×120 pixels
                </p>
                <Input type="file" accept="image/png" onChange={handleFileChange} />
              </div>
              {preview && (
                <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/30">
                  <img src={preview} alt="Preview" className="h-[120px] w-[176px] object-contain" />
                </div>
              )}
              <Button onClick={handleAdd} disabled={uploading} className="w-full">
                {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                {uploading ? "Enviando..." : "Adicionar logo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum logo cadastrado.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Ordem</TableHead>
                  <TableHead className="w-[200px]">Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-24 text-center">Ativo</TableHead>
                  <TableHead className="w-20 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext items={sorted.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  {sorted.map((logo, idx) => (
                    <SortableRow
                      key={logo.id}
                      logo={logo}
                      index={idx}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default AdminClientes;
