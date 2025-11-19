<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\View\View;

class PlotterEditorController extends Controller
{
    /**
     * Display the SVG Plotter Editor interface.
     *
     * @return View
     */
    public function index(): View
    {
        return view('plotter-editor');
    }
}
